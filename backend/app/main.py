import os

import fastapi as fa
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.quiz import router as quiz_router
from app.database import get_collection
from app.models import AssignedInteractiveCourse, InteractiveCourse
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


@app.get("/me/courses")
async def list_my_courses(token: EmployeeToken = GetEmployeeJWT()):
    try:
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
            if course_doc:
                course = InteractiveCourse(**course_doc)
                result.append(
                    {
                        "assignment_id": a.id,
                        "course_name": course.name,
                        "quiz_required": course.quiz_required,
                        "status": a.status,
                        "quiz_status": a.quiz_status,
                        "quiz_attempts_count": a.quiz_attempts_count,
                    }
                )
        return result
    except AuthorizationError as exc:
        raise fa.HTTPException(status_code=401, detail=str(exc))
