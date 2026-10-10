"""Demo login for presentations: name + mobile + a fixed code.

Works ONLY when DEMO_LOGIN_ENABLED=true is set on the server.
Keep it OFF on the live website, because anyone could log in with the fixed code.
"""

import re
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, hash_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


class DemoLoginInput(BaseModel):
    name: str
    mobile: str
    otp: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v[:100]

    @field_validator("mobile")
    @classmethod
    def mobile_valid(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if not re.fullmatch(r"[6-9]\d{9}", digits):
            raise ValueError("Enter a valid 10-digit mobile number")
        return digits


@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(data: DemoLoginInput, db: AsyncSession = Depends(get_db)):
    if not settings.DEMO_LOGIN_ENABLED:
        raise HTTPException(status_code=404, detail="Not found")

    if data.otp.strip() != settings.DEMO_LOGIN_OTP:
        raise HTTPException(status_code=401, detail="Wrong code. Please try again.")

    # The mobile number becomes the account key (stored in the email field)
    demo_email = f"{data.mobile}@phone.demo"
    result = await db.execute(select(User).where(User.email == demo_email))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            name=data.name,
            email=demo_email,
            # Random password: nobody can log in with a password to this account
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            language="English",
        )
        db.add(user)
    else:
        user.name = data.name

    await db.commit()
    await db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )
