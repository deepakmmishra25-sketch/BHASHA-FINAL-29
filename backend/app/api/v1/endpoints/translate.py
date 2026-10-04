"""Translation endpoint — Groq-powered multilingual translation."""

import io
import re

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.api.v1.dependencies import get_current_active_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/translate", tags=["translation"])

SUPPORTED_LANGUAGES = [
    "English",
    "Hindi",
    "Marathi",
    "Gujarati",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Punjabi",
    "Bengali",
    "Urdu",
    "Odia",
    "Assamese",
]

MAX_PDF_SIZE = 10 * 1024 * 1024
CHUNK_SIZE = 10000


class TranslateInput(BaseModel):
    text: str
    target_language: str
    source_language: str = "auto"


def get_groq_client():
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not configured.",
        )

    from groq import Groq

    return Groq(api_key=settings.GROQ_API_KEY)


def translate_text(client, text: str, target_language: str) -> str:
    """Translate text using Groq."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional translator. "
                    f"Translate the following text to {target_language}. "
                    "Return ONLY the translated text. "
                    "Do not add explanations, notes, or the original text. "
                    "Preserve paragraphs and basic structure."
                ),
            },
            {
                "role": "user",
                "content": text,
            },
        ],
        max_tokens=4000,
        temperature=0.2,
    )

    return response.choices[0].message.content.strip()


def split_text(text: str, chunk_size: int = CHUNK_SIZE) -> list[str]:
    """Split long PDF text into smaller chunks."""

    paragraphs = re.split(r"\n\s*\n", text)

    chunks = []
    current = ""

    for paragraph in paragraphs:
        paragraph = paragraph.strip()

        if not paragraph:
            continue

        candidate = (
            f"{current}\n\n{paragraph}"
            if current
            else paragraph
        )

        if len(candidate) <= chunk_size:
            current = candidate
        else:
            if current:
                chunks.append(current)

            if len(paragraph) > chunk_size:
                for i in range(0, len(paragraph), chunk_size):
                    chunks.append(paragraph[i:i + chunk_size])
                current = ""
            else:
                current = paragraph

    if current:
        chunks.append(current)

    return chunks


# ============================================================
# NORMAL TEXT TRANSLATION
# ============================================================

@router.post("")
async def translate(
    data: TranslateInput,
    _: User = Depends(get_current_active_user),
):
    client = get_groq_client()

    try:
        translated = translate_text(
            client,
            data.text,
            data.target_language,
        )

        return {
            "translatedText": translated,
            "targetLanguage": data.target_language,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)[:200]}",
        )


# ============================================================
# PDF TRANSLATION
# ============================================================

@router.post("/pdf")
async def translate_pdf(
    file: UploadFile = File(...),
    target_language: str = "Hindi",
    _: User = Depends(get_current_active_user),
):
    """Extract text from a PDF, translate it, and return a new PDF."""

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    if target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {target_language}",
        )

    content = await file.read()

    if len(content) > MAX_PDF_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB.",
        )

    try:
        # ----------------------------------------------------
        # Extract PDF text
        # ----------------------------------------------------

        import pypdf

        reader = pypdf.PdfReader(io.BytesIO(content))

        pages = []

        for page in reader.pages:
            text = page.extract_text() or ""

            if text.strip():
                pages.append(text.strip())

        original_text = "\n\n".join(pages).strip()

        if not original_text:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No selectable text found in this PDF. "
                    "This appears to be a scanned PDF. "
                    "Please use OCR for scanned documents."
                ),
            )

        # ----------------------------------------------------
        # Translate
        # ----------------------------------------------------

        client = get_groq_client()

        chunks = split_text(original_text)

        translated_chunks = []

        for chunk in chunks:
            translated = translate_text(
                client,
                chunk,
                target_language,
            )

            translated_chunks.append(translated)

        translated_text = "\n\n".join(translated_chunks)

        # ----------------------------------------------------
        # Create PDF
        # ----------------------------------------------------

        from reportlab.lib.enums import TA_LEFT
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import (
            ParagraphStyle,
            getSampleStyleSheet,
        )
        from reportlab.platypus import (
            Paragraph,
            SimpleDocTemplate,
            Spacer,
        )

        output = io.BytesIO()

        styles = getSampleStyleSheet()

        body_style = ParagraphStyle(
            "TranslatedBody",
            parent=styles["BodyText"],
            fontSize=10,
            leading=15,
            alignment=TA_LEFT,
            spaceAfter=8,
        )

        doc = SimpleDocTemplate(
            output,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )

        story = []

        for paragraph in translated_text.split("\n"):
            paragraph = paragraph.strip()

            if paragraph:
                safe_text = (
                    paragraph
                    .replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                )

                story.append(
                    Paragraph(
                        safe_text,
                        body_style,
                    )
                )
            else:
                story.append(Spacer(1, 8))

        doc.build(story)

        output.seek(0)

        # ----------------------------------------------------
        # Download filename
        # ----------------------------------------------------

        original_name = file.filename or "document.pdf"

        if original_name.lower().endswith(".pdf"):
            original_name = original_name[:-4]

        download_name = (
            f"{original_name}_{target_language}.pdf"
        )

        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{download_name}"'
                )
            },
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PDF translation failed: {str(e)[:300]}",
        )


# ============================================================
# LANGUAGES
# ============================================================

@router.get("/languages")
async def list_languages(
    _: User = Depends(get_current_active_user),
):
    return {
        "languages": SUPPORTED_LANGUAGES
    }
