from datetime import datetime, timedelta, timezone

import fastapi as fa
import jwt
from fastapi import Header
from pydantic_settings import BaseSettings

from app.exceptions import AuthorizationError

from .types import EmployeeToken


class Settings(BaseSettings):
    academy_jwt_secret: str


_settings = Settings()

_ALGORITHM = "HS256"
_TOKEN_TTL_HOURS = 24


def encode(employee_id: str, company_id: str) -> str:
    payload = {
        "sub": employee_id,
        "company_id": company_id,
        "exp": datetime.now(tz=timezone.utc) + timedelta(hours=_TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, _settings.academy_jwt_secret, algorithm=_ALGORITHM)


def decode(token: str) -> EmployeeToken:
    try:
        payload = jwt.decode(
            token, _settings.academy_jwt_secret, algorithms=[_ALGORITHM]
        )
        return EmployeeToken(
            employee_id=payload["sub"], company_id=payload["company_id"]
        )
    except jwt.PyJWTError as exc:
        raise AuthorizationError("Invalid or expired token") from exc


def GetEmployeeJWT() -> fa.params.Depends:
    def _dep(authorization: str = Header()) -> EmployeeToken:
        if not authorization.startswith("Bearer "):
            raise AuthorizationError("Missing bearer token")
        return decode(authorization.removeprefix("Bearer "))

    return fa.Depends(_dep)
