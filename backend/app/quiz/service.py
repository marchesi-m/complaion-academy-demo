import logging
import random
from datetime import datetime

from app import enums
from app.database import get_collection
from app.exceptions import AuthorizationError, NotFoundError, NotProcessableError
from app.models import (
    AssignedInteractiveCourse,
    InteractiveCourse,
    Quiz,
    QuizAttempt,
    ServedQuestion,
)
from app.auth.types import EmployeeToken

from .types import (
    AnswerOptionResponse,
    QuizFetchResponse,
    QuizStatusResponse,
    QuizSubmitResponse,
    ServedQuestionResponse,
    SubmitAnswersRequest,
)

logger = logging.getLogger(__name__)

_NANO_ID = __import__("uuid").uuid4


def _now_str() -> str:
    return datetime.utcnow().isoformat()


async def _get_one(collection: str, query: dict):
    doc = await get_collection(collection).find_one(query)
    return doc


async def _update_one(collection: str, query: dict, update: dict):
    await get_collection(collection).update_one(query, update)


class QuizService:
    async def fetch_quiz(
        self, assigned_course_id: str, token: EmployeeToken
    ) -> QuizFetchResponse:
        assignment = await self._get_assignment(assigned_course_id, token.employee_id)
        course_doc = await _get_one("interactive_courses", {"id": assignment.interactive_course_id})
        if not course_doc:
            raise NotFoundError("Course not found")
        course = InteractiveCourse(**course_doc)

        if len(assignment.documents_read) < len(course.documents):
            raise NotProcessableError("Course content not yet completed")
        if not course.quiz_required:
            raise NotFoundError("No quiz configured for this course")

        quiz = await self._lookup_quiz(assignment.interactive_course_id, token.company_id)

        course_name = course_doc.get("name", "")

        match assignment.quiz_status:
            case enums.QuizStatus.EXHAUSTED:
                raise AuthorizationError("Maximum attempts reached")
            case enums.QuizStatus.PASSED:
                return QuizFetchResponse(
                    already_passed=True,
                    attempt_number=0,
                    attempts_remaining=0,
                    course_name=course_name,
                    questions=[],
                )
            case enums.QuizStatus.IN_PROGRESS:
                attempt = await self._get_open_attempt(assigned_course_id)
                return self._build_fetch_response(attempt, quiz, course_name)
            case enums.QuizStatus.NOT_STARTED:
                return await self._start_new_attempt(assignment, quiz, token, course_name)

    async def submit_answers(
        self,
        assigned_course_id: str,
        body: SubmitAnswersRequest,
        token: EmployeeToken,
    ) -> QuizSubmitResponse:
        assignment = await self._get_assignment(assigned_course_id, token.employee_id)
        attempt = await self._get_open_attempt(assigned_course_id)
        quiz_doc = await _get_one("quizzes", {"id": attempt.quiz_id})
        quiz = Quiz(**quiz_doc)

        correct = sum(
            1
            for q in attempt.served_questions
            if set(body.answers.get(q.question_id, [])) == set(q.correct_option_ids)
        )
        score = correct / len(attempt.served_questions)
        passed = score >= quiz.passing_score
        now = datetime.utcnow()

        await _update_one(
            "quiz_attempts",
            {"id": attempt.id},
            {
                "$set": {
                    "submitted_answers": body.answers,
                    "score": score,
                    "passed": passed,
                    "completed_at": now,
                }
            },
        )

        new_count = assignment.quiz_attempts_count + 1
        if passed:
            await self._complete_assignment(assignment, new_count, score)
        else:
            exhausted = quiz.max_attempts != -1 and new_count >= quiz.max_attempts
            new_status = (
                enums.QuizStatus.EXHAUSTED if exhausted else enums.QuizStatus.NOT_STARTED
            )
            await _update_one(
                "assigned_interactive_courses",
                {"id": assigned_course_id},
                {"$set": {"quiz_attempts_count": new_count, "quiz_status": new_status, "last_quiz_score": score}},
            )

        attempts_remaining = (
            -1 if quiz.max_attempts == -1 else max(0, quiz.max_attempts - new_count)
        )
        return QuizSubmitResponse(
            score=score,
            passed=passed,
            attempts_used=new_count,
            attempts_remaining=attempts_remaining,
        )

    async def get_status(
        self, assigned_course_id: str, token: EmployeeToken
    ) -> QuizStatusResponse:
        assignment = await self._get_assignment(assigned_course_id, token.employee_id)
        quiz = await self._lookup_quiz(assignment.interactive_course_id, token.company_id)
        attempts_remaining = (
            -1
            if quiz.max_attempts == -1
            else max(0, quiz.max_attempts - assignment.quiz_attempts_count)
        )
        return QuizStatusResponse(
            quiz_status=assignment.quiz_status,
            attempts_used=assignment.quiz_attempts_count,
            attempts_remaining=attempts_remaining,
            passed=assignment.quiz_status == enums.QuizStatus.PASSED,
        )

    async def _get_assignment(
        self, assigned_course_id: str, employee_id: str
    ) -> AssignedInteractiveCourse:
        doc = await _get_one("assigned_interactive_courses", {"id": assigned_course_id})
        if not doc:
            raise NotFoundError("Assignment not found")
        assignment = AssignedInteractiveCourse(**doc)
        if assignment.employee_id != employee_id:
            raise AuthorizationError("Assignment does not belong to caller")
        return assignment

    async def _lookup_quiz(self, course_id: str, company_id: str) -> Quiz:
        doc = await _get_one("quizzes", {"course_id": course_id, "company_id": company_id})
        if not doc:
            doc = await _get_one("quizzes", {"course_id": course_id, "company_id": None})
        if not doc:
            raise NotFoundError("Quiz not found")
        return Quiz(**doc)

    async def _get_open_attempt(self, assigned_course_id: str) -> QuizAttempt:
        doc = await _get_one(
            "quiz_attempts",
            {"assigned_course_id": assigned_course_id, "completed_at": None},
        )
        if not doc:
            raise NotFoundError("No open attempt found")
        return QuizAttempt(**doc)

    async def _start_new_attempt(
        self,
        assignment: AssignedInteractiveCourse,
        quiz: Quiz,
        token: EmployeeToken,
        course_name: str = "",
    ) -> QuizFetchResponse:
        selected = random.sample(
            quiz.questions,
            min(quiz.questions_per_attempt, len(quiz.questions)),
        )
        served = [
            ServedQuestion(
                question_id=q.id,
                type=q.type,
                text=q.text,
                options=q.options,
                correct_option_ids=q.correct_option_ids,
            )
            for q in selected
        ]
        attempt = QuizAttempt(
            id=f"qat_{_NANO_ID().hex[:12]}",
            assigned_course_id=assignment.id,
            employee_id=token.employee_id,
            company_id=token.company_id,
            quiz_id=quiz.id,
            attempt_number=assignment.quiz_attempts_count + 1,
            served_questions=served,
        )
        await get_collection("quiz_attempts").insert_one(
            attempt.model_dump(mode="json")
        )
        await _update_one(
            "assigned_interactive_courses",
            {"id": assignment.id},
            {"$set": {"quiz_status": enums.QuizStatus.IN_PROGRESS}},
        )
        return self._build_fetch_response(attempt, quiz, course_name)

    def _build_fetch_response(
        self, attempt: QuizAttempt, quiz: Quiz, course_name: str = ""
    ) -> QuizFetchResponse:
        attempts_remaining = (
            -1
            if quiz.max_attempts == -1
            else max(0, quiz.max_attempts - attempt.attempt_number)
        )
        questions = [
            ServedQuestionResponse(
                question_id=q.question_id,
                type=q.type,
                text=q.text,
                options=[
                    AnswerOptionResponse(id=o.id, text=o.text, is_correct=o.id in q.correct_option_ids)
                    for o in q.options
                ],
            )
            for q in attempt.served_questions
        ]
        return QuizFetchResponse(
            attempt_number=attempt.attempt_number,
            attempts_remaining=attempts_remaining,
            course_name=course_name,
            questions=questions,
        )

    async def _complete_assignment(
        self, assignment: AssignedInteractiveCourse, new_count: int, score: float
    ) -> None:
        now = _now_str()
        await _update_one(
            "assigned_interactive_courses",
            {"id": assignment.id},
            {
                "$set": {
                    "status": enums.AssignedInteractiveCourseStatus.DONE,
                    "completed_date": now,
                    "quiz_status": enums.QuizStatus.PASSED,
                    "quiz_attempts_count": new_count,
                    "last_quiz_score": score,
                }
            },
        )
