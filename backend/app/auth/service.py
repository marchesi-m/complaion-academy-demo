import bcrypt

from app.database import get_collection
from app.exceptions import AuthorizationError
from app.models import Employee

from . import _jwt
from .types import TokenResponse


class AuthService:
    async def login(self, email: str, password: str) -> TokenResponse:
        doc = await get_collection("employees").find_one({"email": email})
        employee = Employee(**doc) if doc else None
        if not employee or not employee.hashed_password:
            raise AuthorizationError("Invalid credentials")
        if not bcrypt.checkpw(password.encode(), employee.hashed_password.encode()):
            raise AuthorizationError("Invalid credentials")
        return TokenResponse(
            access_token=_jwt.encode(
                employee_id=employee.id,
                company_id=employee.company_id,
            )
        )
