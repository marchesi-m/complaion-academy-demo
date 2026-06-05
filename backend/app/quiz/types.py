import pydantic as pyd

from app.enums import QuizStatus


class AnswerOptionResponse(pyd.BaseModel):
    id: str
    text: str
    is_correct: bool = False


class ServedQuestionResponse(pyd.BaseModel):
    question_id: str
    type: str
    text: str
    options: list[AnswerOptionResponse]


class QuizFetchResponse(pyd.BaseModel):
    attempt_number: int
    attempts_remaining: int
    course_name: str = ""
    questions: list[ServedQuestionResponse]
    already_passed: bool = False


class SubmitAnswersRequest(pyd.BaseModel):
    answers: dict[str, list[str]]


class QuizSubmitResponse(pyd.BaseModel):
    score: float
    passed: bool
    attempts_used: int
    attempts_remaining: int


class QuizStatusResponse(pyd.BaseModel):
    quiz_status: QuizStatus
    attempts_used: int
    attempts_remaining: int
    passed: bool
