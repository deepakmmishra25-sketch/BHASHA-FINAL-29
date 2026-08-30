"""AI Chat endpoints — Groq-powered multilingual conversation."""

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


def _get_ai_response(history, message: str, language: str = "English") -> str:
    api_key = getattr(settings, "GROQ_API_KEY", None)
    if not api_key:
        return "🔑 GROQ_API_KEY is not configured. Please add it to your Railway environment variables."
    try:
        import httpx

        msgs = [
            {"role": "system", "content": SYSTEM_PROMPT + f"\n\nIMPORTANT: The user has selected {language} as their language. You MUST respond in {language} only, regardless of what language the user writes in."},
            {"role": "user", "content": message},
        ]

        r = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "openai/gpt-oss-20b",
                "messages": msgs,
                "max_tokens": 1024,
            },
            timeout=30,
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"I'm having trouble right now. Please try again. (Error: {str(e)[:100]})"


async def _record_chat_event(user_id: str, language: str) -> None:
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

    user_msg = ChatMessage(session_id=session.id, role="user", content=data.message, language=data.language)
    db.add(user_msg)

    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
    )
    history = list(reversed(history_result.scalars().all()))

    ai_text = _get_ai_response(history, data.message, data.language)

    ai_msg = ChatMessage(session_id=session.id, role="assistant", content=ai_text, language=data.language)
    db.add(ai_msg)

    if is_first_chat:
        from app.services.notification_service import notify_first_chat
        await notify_first_chat(db, current_user.id, current_user.language or "English")

    await db.commit()

    background_tasks.add_task(_record_chat_event, current_user.id, data.language)

    return {
        "sessionId": session.id,
        "userMessage": {"id": user_msg.id, "role": "user", "content": data.message},
        "aiMessage": {"id": ai_msg.id, "role": "assistant", "content": ai_text},
    }


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Session not found")

    msgs = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    )
    return [{"id": m.id, "role": m.role, "content": m.content, "createdAt": m.created_at.isoformat()} for m in msgs.scalars().all()]
