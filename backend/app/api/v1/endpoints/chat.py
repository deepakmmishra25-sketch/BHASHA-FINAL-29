"""AI Chat endpoints — Gemini-powered multilingual conversation."""

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user
from app.core.config import settings
from app.db.database import AsyncSessionLocal, get_db
from app.models.analytics import UsageEvent
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatInput(BaseModel):
    message: str
    session_id: str | None = None
    language: str = "English"


SYSTEM_PROMPT = """You are BhashaSetu AI — a friendly, knowledgeable business mentor and advisor for rural entrepreneurs, farmers, MSMEs, students, and small business owners in India.

Key guidelines:
- Always respond in the language the user writes in (Hindi, Tamil, Telugu, Gujarati, Marathi, Bengali, Kannada, Malayalam, Punjabi, Urdu, Odia, Assamese, or English)
- Give practical, actionable advice tailored to the Indian market
- Reference relevant government schemes when applicable
- Use simple language — your users may not be highly educated
- Be encouraging, warm, and culturally sensitive
- Keep responses concise but helpful (2-4 paragraphs max)

Topics you can help with: business planning, farming advice, government schemes, digital payments, marketing, finance, legal basics, skill development."""


def _get_gemini_client():
    api_key = getattr(settings, "GEMINI_API_KEY", None)
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        for model_name in [
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash-8b",
            "gemini-1.5-flash",
            "gemini-pro",
        ]:
            try:
                model = genai.GenerativeModel(model_name)
                model.generate_content("hi")
                return model
            except Exception:
                continue
        return None
    except Exception:
        return None


# ── Background task helpers ───────────────────────────────────────────────────

async def _record_chat_event(user_id: str, language: str) -> None:
    """Record a chat analytics event in a dedicated session (non-blocking)."""
    async with AsyncSessionLocal() as session:
        try:
            session.add(UsageEvent(
                user_id=user_id,
                event_type="message_sent",
                feature="chat",
                language=language,
            ))
            await session.commit()
        except Exception:
            await session.rollback()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/models")
async def list_models():
    """Temporary debug endpoint — shows available Gemini models. Remove after testing."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        models = [m.name for m in genai.list_models()]
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}


@router.get("/sessions")
async def list_sessions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .limit(20)
    )
    sessions = result.scalars().all()
    return [{"id": s.id, "title": s.title, "language": s.language, "updatedAt": s.updated_at.isoformat()} for s in sessions]


@router.post("/send")
async def send_message(
    data: ChatInput,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # Get or create session
    session = None
    if data.session_id:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == data.session_id,
                ChatSession.user_id == current_user.id,
            )
        )
        session = result.scalar_one_or_none()

    is_first_chat = False
    if not session:
        count_q = await db.execute(
            select(func.count()).where(ChatSession.user_id == current_user.id)
        )
        is_first_chat = (count_q.scalar() or 0) == 0

        session = ChatSession(
            user_id=current_user.id,
            language=data.language,
            title=data.message[:50] + ("..." if len(data.message) > 50 else ""),
        )
        db.add(session)
        await db.flush()

    # Store user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=data.message, language=data.language)
    db.add(user_msg)

    # Fetch recent history (last 10
