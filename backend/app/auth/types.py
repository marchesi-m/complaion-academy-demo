import pydantic as pyd


class LoginRequest(pyd.BaseModel):
    email: str
    password: str


class TokenResponse(pyd.BaseModel):
    access_token: str
    token_type: str = "bearer"


class EmployeeToken(pyd.BaseModel):
    employee_id: str
    company_id: str
    email: str
