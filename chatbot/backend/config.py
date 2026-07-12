"""
config.py — Centralised configuration for the AssetFlow chatbot backend.

All environment variables are read here. The rest of the application imports
from this module so configuration never leaks into business logic.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the same directory as this file
_BASE_DIR = Path(__file__).resolve().parent
load_dotenv(_BASE_DIR / ".env")


class Config:
    # ── Groq API ──────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"

    # ── LLM generation parameters ────────────────────────────────────────────
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.5"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1024"))

    # ── Conversation context ─────────────────────────────────────────────────
    # Number of user+assistant *pairs* kept in memory per session
    MAX_CONTEXT_PAIRS: int = int(os.getenv("MAX_CONTEXT_PAIRS", "10"))

    # ── Server ────────────────────────────────────────────────────────────────
    PORT: int = int(os.getenv("PORT", "5001"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    ]

    # ── System prompt ─────────────────────────────────────────────────────────
    SYSTEM_PROMPT_PATH: Path = _BASE_DIR / "prompts" / "system_prompt.txt"

    @classmethod
    def validate(cls) -> None:
        """Raise an informative error early if critical config is missing."""
        if not cls.GROQ_API_KEY or cls.GROQ_API_KEY.startswith("gsk_your"):
            raise EnvironmentError(
                "GROQ_API_KEY is not set. "
                "Copy .env.example to .env and add your key from https://console.groq.com/keys"
            )
