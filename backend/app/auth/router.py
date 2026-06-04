import fastapi as fa

from app.exceptions import AuthorizationError

from .service import AuthService
from .types import LoginRequest, TokenResponse

router = fa.APIRouter(prefix="/auth", tags=["auth"])
_service = AuthService()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    try:
        return await _service.login(body.email, body.password)
    except AuthorizationError as exc:
        raise fa.HTTPException(status_code=401, detail=str(exc))
