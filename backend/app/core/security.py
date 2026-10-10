"""
JWT security utilities — token creation and verification.
"""

import time
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEFAULT_ACCESS_MINUTES = 30
DEFAULT_REFRESH_DAYS = 7


def _access_minutes() -> int:
    # If the env value is missing, zero or negative, use a safe default.
    # A zero/negative value would create tokens that are already expired.
    value = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    return value if value > 0 else DEFAULT_ACCESS_MINUTES


def _refresh_days() -> int:
    value = settings.REFRESH_TOKEN_EXPIRE_DAYS
    return value if value > 0 else DEFAULT_REFRESH_DAYS


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: Any, expires_seconds: int | None = None) -> str:
    now = int(time.time())
    lifetime = expires_seconds if expires_seconds else _access_minutes() * 60
    payload = {"sub": str(subject), "iat": now, "exp": now + lifetime, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: Any) -> str:
    now = int(time.time())
    lifetime = _refresh_days() * 24 * 60 * 60
    payload = {"sub": str(subject), "iat": now, "exp": now + lifetime, "type": "refresh"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e
