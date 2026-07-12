"""
chatbot/service.py — Conversation manager and core business logic.

This is the single orchestration layer between the HTTP routes and the LLM.
Future features (RAG document search, database lookups, tool calling,
role-based context injection) should be added here, not in routes.py.
"""

import time
import uuid
from collections import defaultdict
from pathlib import Path
from threading import Lock

from config import Config
from chatbot.groq_client import GroqAPIError, call_groq
from chatbot.logger import get_logger, log_error, log_request, log_response

log = get_logger(__name__)

# ─── System Prompt ────────────────────────────────────────────────────────────

def _load_system_prompt() -> str:
    """
    Load the system prompt from the text file at startup.
    If the file is missing, fall back to a safe default and log a warning.
    """
    path: Path = Config.SYSTEM_PROMPT_PATH
    if path.exists():
        content = path.read_text(encoding="utf-8").strip()
        log.info(f"System prompt loaded from {path}  ({len(content)} chars)")
        return content
    else:
        log.warning(
            f"System prompt file not found at {path}. Using built-in fallback."
        )
        return (
            "You are AssetFlow Assistant, a helpful business support AI. "
            "Answer user questions about the AssetFlow ERP platform clearly and concisely."
        )


SYSTEM_PROMPT: str = _load_system_prompt()


# ─── In-Memory Conversation Store ────────────────────────────────────────────
# Each session_id maps to a list of {"role": ..., "content": ...} dicts.
# For production with multiple workers, replace with Redis or a DB.

_conversations: dict[str, list[dict[str, str]]] = defaultdict(list)
_lock = Lock()


def _trim_context(history: list[dict[str, str]]) -> list[dict[str, str]]:
    """
    Keep at most MAX_CONTEXT_PAIRS user+assistant pairs.
    Older messages are dropped so the context window doesn't overflow.
    """
    max_messages = Config.MAX_CONTEXT_PAIRS * 2
    if len(history) > max_messages:
        return history[-max_messages:]
    return history


# ─── Public API ───────────────────────────────────────────────────────────────

def create_session() -> str:
    """Generate a new unique session ID."""
    return str(uuid.uuid4())


def chat(message: str, session_id: str) -> dict:
    """
    Process a user message and return the assistant reply.

    Args:
        message:    Raw text from the user.
        session_id: Identifies the conversation context.

    Returns:
        dict with keys:
            reply      (str)   — the assistant's response
            session_id (str)   — echoed back for the frontend to store
    """
    log_request(log, session_id, message)
    t0 = time.perf_counter()

    with _lock:
        history = _conversations[session_id]

        # Append the new user turn
        history.append({"role": "user", "content": message})

        # Trim to configured window
        history = _trim_context(history)
        _conversations[session_id] = history

    # Build the full message list: system prompt + trimmed history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history

    try:
        reply = call_groq(messages)
    except GroqAPIError as exc:
        log_error(log, session_id, exc)
        # Return a user-friendly error — don't expose internal detail
        if exc.status_code == 401:
            reply = (
                "I'm unable to connect right now due to an authentication issue. "
                "Please contact support."
            )
        elif exc.status_code == 429:
            reply = (
                "I'm receiving a lot of requests right now. "
                "Please try again in a moment."
            )
        else:
            reply = (
                "I'm temporarily unable to respond. "
                "Please try again shortly or contact support if the issue persists."
            )
        # Don't store failed responses in history
        with _lock:
            _conversations[session_id].pop()  # remove the user turn we just appended
        return {"reply": reply, "session_id": session_id, "error": True}

    except Exception as exc:  # network errors, timeouts, etc.
        log_error(log, session_id, exc)
        with _lock:
            _conversations[session_id].pop()
        return {
            "reply": "I'm having trouble reaching the AI service right now. Please try again.",
            "session_id": session_id,
            "error": True,
        }

    # Store the assistant reply in history
    with _lock:
        _conversations[session_id].append({"role": "assistant", "content": reply})

    elapsed_ms = (time.perf_counter() - t0) * 1000
    log_response(log, session_id, reply, elapsed_ms)

    return {"reply": reply, "session_id": session_id}


def clear_session(session_id: str) -> None:
    """Discard all conversation history for a session (e.g. on logout)."""
    with _lock:
        _conversations.pop(session_id, None)
    log.info(f"[SESSION_CLEARED] session={session_id!r}")


def session_info(session_id: str) -> dict:
    """Return metadata about a session (used by the health/debug endpoint)."""
    with _lock:
        history = _conversations.get(session_id, [])
    return {
        "session_id": session_id,
        "turn_count": len(history) // 2,
        "message_count": len(history),
    }
