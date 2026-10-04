"""Translation endpoint — Groq-powered multilingual translation."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.v1.dependencies import get_current_active_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/translate", tags=["translation"])

SUPPORTED_LANGUAGES = [
    "English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu",
    "Kannada", "Malayalam", "Punjabi", "Bengali", "Urdu", "Odia", "Assamese",
]


class TranslateInput(BaseModel):
    text: str
    target_language: str
    source_language: str = "auto"


@router.post("")
async def translate(
    data: TranslateInput,
    _: User = Depends(get_current_active_user),
):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured.")

    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a professional translator. "
                        f"Translate the given text to {data.target_language}. "
                        f"Return ONLY the translated text, nothing else. "
                        f"No explanations, no notes, no original text."
                    ),
                },
                {
                    "role": "user",
                    "content": data.text,
                },
            ],
            max_tokens=4000,
            temperature=0.3,
        )

        translated = response.choices[0].message.content.strip()
        return {
            "translatedText": translated,
            "targetLanguage": data.target_language,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)[:200]}")


@router.get("/languages")
async def list_languages(_: User = Depends(get_current_active_user)):
    return {"languages": SUPPORTED_LANGUAGES}
