"""
chatbot/routes.py — Flask Blueprint defining the chatbot HTTP endpoints.

Only HTTP concerns live here (parsing JSON, returning status codes).
All business logic is delegated to chatbot.service.
"""

from flask import Blueprint, jsonify, request

from chatbot.logger import get_logger
from chatbot.service import chat, clear_session, create_session, session_info
from config import Config

log = get_logger(__name__)

chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/api")


# ─── POST /api/chat ───────────────────────────────────────────────────────────

@chatbot_bp.route("/chat", methods=["POST"])
def chat_endpoint():
    """
    Accept a user message and return an AI-generated reply.

    Request body (JSON):
        {
            "message":    "How do I assign an asset to an employee?",  # required
            "session_id": "abc123"                                      # optional
        }

    Response (JSON):
        {
            "reply":      "To assign an asset ...",
            "session_id": "abc123"
        }

    Error response (JSON):
        {
            "error":   "message is required",
            "status":  400
        }
    """
    data: dict = request.get_json(silent=True) or {}

    # ── Validate input ────────────────────────────────────────────────────────
    message: str = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "message is required and must be a non-empty string", "status": 400}), 400

    if len(message) > 4000:
        return jsonify({"error": "message exceeds maximum length of 4000 characters", "status": 400}), 400

    # ── Session management ────────────────────────────────────────────────────
    session_id: str = (data.get("session_id") or "").strip() or create_session()

    # ── Process ───────────────────────────────────────────────────────────────
    result = chat(message=message, session_id=session_id)

    status_code = 503 if result.get("error") else 200
    return jsonify(result), status_code


# ─── DELETE /api/chat/<session_id> ────────────────────────────────────────────

@chatbot_bp.route("/chat/<session_id>", methods=["DELETE"])
def clear_session_endpoint(session_id: str):
    """
    Clear conversation history for a given session (e.g. on user logout).

    Response (JSON):
        { "cleared": true, "session_id": "abc123" }
    """
    clear_session(session_id)
    return jsonify({"cleared": True, "session_id": session_id}), 200


# ─── GET /api/health ──────────────────────────────────────────────────────────

@chatbot_bp.route("/health", methods=["GET"])
def health():
    """
    Liveness check. Returns 200 if the service is running.
    Does NOT make a live Groq call (fast — suitable for load balancer probes).

    Response (JSON):
        {
            "status":    "ok",
            "model":     "llama-3.3-70b-versatile",
            "api_key_configured": true
        }
    """
    return jsonify(
        {
            "status": "ok",
            "model": Config.GROQ_MODEL,
            "api_key_configured": bool(Config.GROQ_API_KEY),
        }
    ), 200


# ─── GET /api/session/<session_id> ────────────────────────────────────────────

@chatbot_bp.route("/session/<session_id>", methods=["GET"])
def session_info_endpoint(session_id: str):
    """
    Return metadata about a session (turn count, message count).
    Useful for debugging and testing.
    """
    return jsonify(session_info(session_id)), 200
