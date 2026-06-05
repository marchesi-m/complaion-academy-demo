import os
from datetime import datetime, timezone

import fastapi as fa
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.quiz import router as quiz_router
from app.database import get_collection
from app.models import AssignedInteractiveCourse, InteractiveCourse, Quiz
from app.auth._jwt import GetEmployeeJWT
from app.auth.types import EmployeeToken
from app.exceptions import AuthorizationError, NotFoundError

app = fa.FastAPI(title="Complaion Academy Demo")

_FRONTEND_ORIGINS = os.environ.get(
    "FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(quiz_router)


@app.get("/", include_in_schema=False)
async def root():
    return fa.responses.RedirectResponse("/docs")


@app.get("/health")
async def health():
    return {"status": "ok"}


def _format_assignment(a: AssignedInteractiveCourse, course: InteractiveCourse, max_attempts: int | None) -> dict:
    return {
        "assignment_id": a.id,
        "course_name": course.name,
        "quiz_required": course.quiz_required,
        "status": a.status,
        "quiz_status": a.quiz_status,
        "quiz_attempts_count": a.quiz_attempts_count,
        "max_attempts": max_attempts,
        "content_completed": a.content_completed_date is not None,
        "completed_date": a.completed_date,
        "last_quiz_score": a.last_quiz_score,
    }


@app.get("/me/courses")
async def list_my_courses(token: EmployeeToken = GetEmployeeJWT()):
    cursor = get_collection("assigned_interactive_courses").find(
        {"employee_id": token.employee_id}
    )
    assignments = []
    async for doc in cursor:
        assignments.append(AssignedInteractiveCourse(**doc))

    result = []
    for a in assignments:
        course_doc = await get_collection("interactive_courses").find_one(
            {"id": a.interactive_course_id}
        )
        if not course_doc:
            continue
        course = InteractiveCourse(**course_doc)
        max_attempts = None
        if course.quiz_required:
            quiz_doc = await get_collection("quizzes").find_one({"course_id": course.id})
            if quiz_doc:
                max_attempts = Quiz(**quiz_doc).max_attempts
        result.append(_format_assignment(a, course, max_attempts))
    return result


@app.post("/me/courses/{assignment_id}/complete-video")
async def complete_video(assignment_id: str, token: EmployeeToken = GetEmployeeJWT()):
    doc = await get_collection("assigned_interactive_courses").find_one(
        {"id": assignment_id, "employee_id": token.employee_id}
    )
    if not doc:
        raise fa.HTTPException(status_code=404, detail="Assignment not found")
    a = AssignedInteractiveCourse(**doc)

    course_doc = await get_collection("interactive_courses").find_one(
        {"id": a.interactive_course_id}
    )
    if not course_doc:
        raise fa.HTTPException(status_code=404, detail="Course not found")
    course = InteractiveCourse(**course_doc)

    now = datetime.now(tz=timezone.utc).isoformat()
    documents_read = {course.documents[0]: now} if course.documents else {"video": now}

    if not course.quiz_required:
        updates = {
            "documents_read": documents_read,
            "content_completed_date": now,
            "status": "done",
            "completed_date": now,
        }
    else:
        updates = {
            "documents_read": documents_read,
            "content_completed_date": now,
            "status": "pending",
        }

    await get_collection("assigned_interactive_courses").update_one(
        {"id": assignment_id}, {"$set": updates}
    )

    updated_doc = await get_collection("assigned_interactive_courses").find_one({"id": assignment_id})
    a = AssignedInteractiveCourse(**updated_doc)
    max_attempts = None
    if course.quiz_required:
        quiz_doc = await get_collection("quizzes").find_one({"course_id": course.id})
        if quiz_doc:
            max_attempts = Quiz(**quiz_doc).max_attempts
    return _format_assignment(a, course, max_attempts)


@app.post("/me/courses/{assignment_id}/retake")
async def retake_course(assignment_id: str, token: EmployeeToken = GetEmployeeJWT()):
    doc = await get_collection("assigned_interactive_courses").find_one(
        {"id": assignment_id, "employee_id": token.employee_id}
    )
    if not doc:
        raise fa.HTTPException(status_code=404, detail="Assignment not found")
    a = AssignedInteractiveCourse(**doc)

    if a.quiz_status != "exhausted":
        raise fa.HTTPException(status_code=400, detail="Course can only be retaken when quiz is exhausted")

    course_doc = await get_collection("interactive_courses").find_one(
        {"id": a.interactive_course_id}
    )
    if not course_doc:
        raise fa.HTTPException(status_code=404, detail="Course not found")
    course = InteractiveCourse(**course_doc)

    updates = {
        "documents_read": {},
        "content_completed_date": None,
        "completed_date": None,
        "quiz_status": "not_started",
        "quiz_attempts_count": 0,
        "status": "todo",
        "last_quiz_score": None,
    }
    await get_collection("assigned_interactive_courses").update_one(
        {"id": assignment_id}, {"$set": updates}
    )

    updated_doc = await get_collection("assigned_interactive_courses").find_one({"id": assignment_id})
    a = AssignedInteractiveCourse(**updated_doc)
    quiz_doc = await get_collection("quizzes").find_one({"course_id": course.id})
    max_attempts = Quiz(**quiz_doc).max_attempts if quiz_doc else None
    return _format_assignment(a, course, max_attempts)
