import enum


class AssignedInteractiveCourseStatus(enum.StrEnum):
    TODO = "todo"
    PENDING = "pending"
    DONE = "done"


class QuizStatus(enum.StrEnum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    EXHAUSTED = "exhausted"
