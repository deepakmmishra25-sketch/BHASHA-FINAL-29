"""PDF text translation — upload a PDF, get the translated text back (not a file)."""

import io

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.api.v1.dependencies import get_current_active_user
from app.api.v1.endpoints.translate import (
    MAX_PDF_SIZE,
    SUPPORTED_LANGUAGES,
    get_groq_client,
    split_text,
    translate_text,
)
from app.models.user import User

router = APIRouter(prefix="/translate", tags=["translation"])


@router.post("/pdf-text")
async def translate_pdf_text(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    _: User = Depends(get_current_active_user),
):
    """Read the text in a PDF and return it translated into the chosen language."""

    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    if target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {target_language}")

    content = await file.read()

    if len(content) > MAX_PDF_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    try:
        import pypdf

        reader = pypdf.PdfReader(io.BytesIO(content))

        pages = []
        for page in reader.pages:
            text = (page.extract_text() or "").strip()
            if text:
                pages.append(text)

        original_text = "\n\n".join(pages).strip()

        if not original_text:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No selectable text found in this PDF. "
                    "It looks like a scanned PDF. Please use the OCR page for scanned documents."
                ),
            )

        client = get_groq_client()

        translated_chunks = [
            translate_text(client, chunk, target_language)
            for chunk in split_text(original_text)
        ]

        return {
            "targetLanguage": target_language,
            "pageCount": len(reader.pages),
            "originalText": original_text,
            "translatedText": "\n\n".join(translated_chunks),
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PDF translation failed: {str(e)[:300]}",
        )
