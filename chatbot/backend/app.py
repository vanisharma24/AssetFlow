"""
app.py — Flask application factory and server entry point.

Run with:
    python app.py                   # development
    gunicorn app:create_app()       # production

Environment variables are read from .env (see .env.example).
"""

import sys

from flask import Flask
from flask_cors import CORS

from config import Config
from chatbot.routes import chatbot_bp
from chatbot.logger import get_logger
from middleware.error_handlers import register_error_handlers

log = get_logger("assetflow.chatbot")


def create_app() -> Flask:
    """
    Application factory.

    Returns a fully configured Flask app instance. Using a factory makes the
    app testable (each test can create its own isolated instance) and
    compatible with WSGI servers like Gunicorn or uWSGI.
    """
    # ── Validate config before anything else ─────────────────────────────────
    try:
        Config.validate()
    except EnvironmentError as exc:
        log.error(f"Configuration error: {exc}")
        sys.exit(1)

    # ── Create app ────────────────────────────────────────────────────────────
    app = Flask(__name__)

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS(
        app,
        origins=Config.ALLOWED_ORIGINS,
        methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=False,
    )

    # ── Register blueprint ────────────────────────────────────────────────────
    app.register_blueprint(chatbot_bp)

    # ── Register error handlers ───────────────────────────────────────────────
    register_error_handlers(app)

    # ── Root info route ───────────────────────────────────────────────────────
    @app.get("/")
    def index():
        from flask import jsonify
        return jsonify(
            {
                "service": "AssetFlow Chatbot API",
                "version": "1.0.0",
                "endpoints": {
                    "POST   /api/chat":                   "Send a message, receive an AI reply",
                    "DELETE /api/chat/<session_id>":      "Clear conversation history",
                    "GET    /api/health":                 "Liveness check",
                    "GET    /api/session/<session_id>":   "Session metadata (debug)",
                },
            }
        )

    log.info(
        f"AssetFlow Chatbot API ready — "
        f"model={Config.GROQ_MODEL}  "
        f"port={Config.PORT}  "
        f"debug={Config.DEBUG}  "
        f"allowed_origins={Config.ALLOWED_ORIGINS}"
    )

    return app


# ─── Dev server entry point ───────────────────────────────────────────────────

if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(
        host="0.0.0.0",
        port=Config.PORT,
        debug=Config.DEBUG,
    )