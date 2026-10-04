"""OCR endpoint — Gemini for images, Groq for PDFs."""

import base64
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app.api.v1.dependencies import get_current_active_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/ocr", tags=["ocr"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"}
MAX_SIZE_MB = 10


async def extract_with_gemini(content: bytes, mime: str, language: str) -> str:
    """Use Gemini Vision for images."""
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    b64 = base64.b64encode(content).decode()
    prompt = (
        f"Extract all text from this image. "
        f"Translate to {language} if in a different language. "
        f"Return only the extracted text, preserving structure."
    )
    response = model.generate_content([
        {"mime_type": mime, "data": b64},
        prompt,
    ])
    return response.text.strip()


async def extract_with_groq(content: bytes, language: str) -> str:
    """Use Groq for PDF text extraction."""
    try:
        import pypdf
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        text = text.strip()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read PDF. Make sure it is not scanned/image-based.")

    if not text:
        raise HTTPException(
            status_code=400,
            detail="No text found in PDF. For scanned PDFs, please use an image format (PNG/JPG) instead."
        )

    # If language is not English, translate using Groq
    if language.lower() != "english":
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a translator. Translate the given text to {language}. Return only the translated text, no explanations.",
                },
                {
                    "role": "user",
                    "content": text,
                },
            ],
            max_tokens=4000,
        )
        return response.choices[0].message.content.strip()

    return text


@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    language: str = "English",
    _: User = Depends(get_current_active_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large (max {MAX_SIZE_MB}MB)")

    is_pdf = file.content_type == "application/pdf"

    try:
        if is_pdf:
            # PDFs → Groq
            if not settings.GROQ_API_KEY:
                raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured.")
            extracted = await extract_with_groq(content, language)
        else:
            # Images → Gemini
            if not settings.GEMINI_API_KEY:
                raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")
            extracted = await extract_with_gemini(content, file.content_type or "image/jpeg", language)

        return {
            "extractedText": extracted,
            "language": language,
            "confidence": 0.95,
            "fileName": file.filename,
            "method": "groq-pdf" if is_pdf else "gemini-vision",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)[:200]}")
