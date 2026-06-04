import os
from motor.motor_asyncio import AsyncIOMotorClient

_MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
_DB_NAME = "complaion_demo"

_client: AsyncIOMotorClient | None = None


def get_db():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(_MONGODB_URL)
    return _client[_DB_NAME]


def get_collection(name: str):
    return get_db()[name]
