"""AI Chat endpoints — Claude-powered multilingual conversation."""

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


def _get_ai_response(history: list, message: str) -> str:
    """Generate AI response using Claude (Anthropic)."""
    api_key = getattr(settings, "ANTHROPIC_API_KEY", None)
    if not api_key:
        return (
            "🔑 ANTHROPIC_API_KEY is not configured. "
            "Please add it to your Railway environment variables to enable AI responses."
        )
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        # Build messages list from history — Claude requires alternating user/assistant roles
        msgs = []
        for m in history:
            role = "user" if m.role == "user" else "assistant"
            msgs.append({"role": role, "content": m.content})

        # Append the current user message
        msgs.append({"role": "user", "content": message})

        # Ensure messages alternate properly (Claude strict requirement)
        # If two consecutive messages have the same role, merge them
        merged = []
        for msg in msgs:
            if merged and merged[-1]["role"] == msg["role"]:
                merged[-1]["content"] += "\n" + msg["content"]
            else:
                merged.append(msg)

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=merged,
        )
        return response.content[0].text

    except Exception as e:
        return f"I'm having trouble connecting to the AI service right now. Please try again in a moment. (Error: {str(e)[:100]})"


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
        # Check if this is the user's very first chat session
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

    # Fetch recent history (last 10 messages)
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
    )
    history = list(reversed(history_result.scalars().all()))

    # Generate AI response using Claude
    ai_text = _get_ai_response(history, data.message)

    ai_msg = ChatMessage(session_id=session.id, role="assistant", content=ai_text, language=data.language)
    db.add(ai_msg)

    # First-chat welcome notification
    if is_first_chat:
        from app.services.notification_service import notify_first_chat
        await notify_first_chat(db, current_user.id, current_user.language or "English")

    await db.commit()

    # Analytics event recorded after response is committed — non-blocking
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
