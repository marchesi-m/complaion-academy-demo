import fastapi as fa

from app.auth._jwt import GetEmployeeJWT
from app.auth.types import EmployeeToken
from app.exceptions import AuthorizationError, NotFoundError, NotProcessableError

from .service import QuizService
from .types import (
    QuizFetchResponse,
    QuizStatusResponse,
    QuizSubmitResponse,
    SubmitAnswersRequest,
)

router = fa.APIRouter(
    prefix="/share/interactive_courses/{assigned_course_id}",
    tags=["quiz"],
)
_service = QuizService()


def _handle_errors(exc: Exception) -> fa.HTTPException:
    if isinstance(exc, AuthorizationError):
        return fa.HTTPException(status_code=401, detail=str(exc))
    if isinstance(exc, NotFoundError):
        return fa.HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, NotProcessableError):
        return fa.HTTPException(status_code=422, detail=str(exc))
    raise exc


@router.get("/quiz", response_model=QuizFetchResponse)
async def fetch_quiz(
    assigned_course_id: str,
    token: EmployeeToken = GetEmployeeJWT(),
):
    try:
        return await _service.fetch_quiz(assigned_course_id, token)
    except (AuthorizationError, NotFoundError, NotProcessableError) as exc:
        raise _handle_errors(exc)


@router.post("/quiz/submit", response_model=QuizSubmitResponse)
async def submit_answers(
    assigned_course_id: str,
    body: SubmitAnswersRequest,
    token: EmployeeToken = GetEmployeeJWT(),
):
    try:
        return await _service.submit_answers(assigned_course_id, body, token)
    except (AuthorizationError, NotFoundError, NotProcessableError) as exc:
        raise _handle_errors(exc)


@router.get("/quiz/status", response_model=QuizStatusResponse)
async def get_status(
    assigned_course_id: str,
    token: EmployeeToken = GetEmployeeJWT(),
):
    try:
        return await _service.get_status(assigned_course_id, token)
    except (AuthorizationError, NotFoundError, NotProcessableError) as exc:
        raise _handle_errors(exc)
