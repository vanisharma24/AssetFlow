"""
chatbot/groq_client.py — Isolated Groq API wrapper.

Keeping the HTTP call in its own module means the LLM provider can be swapped
(e.g. OpenAI, Anthropic, a local Ollama server) by replacing only this file.
"""

import time
from typing import Any

import requests

from config import Config
from chatbot.logger import get_logger

log = get_logger(__name__)

# Reuse a single requests.Session for connection pooling
_session = requests.Session()
_session.headers.update(
    {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {Config.GROQ_API_KEY}",
    }
)

# Groq-specific hard limits (prevents runaway costs / rate limit errors)
_REQUEST_TIMEOUT_SECONDS = 30


class GroqAPIError(Exception):
    """Raised when Groq returns a non-200 status or an unparseable response."""

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"Groq API error {status_code}: {detail}")


def call_groq(messages: list[dict[str, str]]) -> str:
    """
    Send a list of OpenAI-format messages to Groq and return the assistant reply.

    Args:
        messages: Full conversation history including the system prompt.
                  Each entry is {"role": "system"|"user"|"assistant", "content": "..."}

    Returns:
        The text content of the assistant's reply.

    Raises:
        GroqAPIError:  Groq returned a non-200 status.
        requests.Timeout: The request timed out.
        requests.RequestException: Network-level error.
    """
    payload: dict[str, Any] = {
        "model": Config.GROQ_MODEL,
        "messages": messages,
        "temperature": Config.LLM_TEMPERATURE,
        "max_tokens": Config.LLM_MAX_TOKENS,
        "top_p": 1,
        "stream": False,
    }

    log.debug(f"Calling Groq  model={Config.GROQ_MODEL}  turns={len(messages)}")
    t0 = time.perf_counter()

    response = _session.post(
        Config.GROQ_API_URL,
        json=payload,
        timeout=_REQUEST_TIMEOUT_SECONDS,
    )

    elapsed_ms = (time.perf_counter() - t0) * 1000
    log.debug(f"Groq responded  status={response.status_code}  elapsed={elapsed_ms:.0f}ms")

    if response.status_code != 200:
        try:
            detail = response.json().get("error", {}).get("message", response.text)
        except Exception:
            detail = response.text
        raise GroqAPIError(status_code=response.status_code, detail=detail)

    data = response.json()

    try:
        reply: str = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise GroqAPIError(
            status_code=200,
            detail=f"Unexpected response shape from Groq: {exc}",
        ) from exc

    return reply.strip()
