import typing as t
from datetime import datetime

import pydantic as pyd

from . import enums


class Employee(pyd.BaseModel):
    id: str
    company_id: str
    email: str
    hashed_password: str | None = None


class InteractiveCourse(pyd.BaseModel):
    id: str
    company_id: str
    name: str
    documents: list[str] = []
    quiz_required: bool = False


class AssignedInteractiveCourse(pyd.BaseModel):
    id: str
    company_id: str
    interactive_course_id: str
    employee_id: str
    status: enums.AssignedInteractiveCourseStatus = enums.AssignedInteractiveCourseStatus.TODO
    documents_read: dict[str, str] = {}
    quiz_status: enums.QuizStatus = enums.QuizStatus.NOT_STARTED
    quiz_attempts_count: int = 0
    content_completed_date: str | None = None
    completed_date: str | None = None


class AnswerOption(pyd.BaseModel):
    id: str
    text: str


class MultipleChoiceQuestion(pyd.BaseModel):
    id: str
    type: t.Literal["multiple_choice"] = "multiple_choice"
    text: str
    options: list[AnswerOption]
    correct_option_ids: list[str]


Question: t.TypeAlias = t.Annotated[
    MultipleChoiceQuestion,
    pyd.Field(discriminator="type"),
]


class ServedQuestion(pyd.BaseModel):
    question_id: str
    type: t.Literal["multiple_choice"] = "multiple_choice"
    text: str
    options: list[AnswerOption]
    correct_option_ids: list[str]


class Quiz(pyd.BaseModel):
    id: str
    course_id: str
    company_id: str | None = None
    questions: list[Question]
    questions_per_attempt: int
    passing_score: float
    max_attempts: int


class QuizAttempt(pyd.BaseModel):
    id: str
    assigned_course_id: str
    employee_id: str
    company_id: str
    quiz_id: str
    attempt_number: int
    served_questions: list[ServedQuestion]
    submitted_answers: dict[str, list[str]] = {}
    score: float | None = None
    passed: bool | None = None
    created_at: datetime = pyd.Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None
