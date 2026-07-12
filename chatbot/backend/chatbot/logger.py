"""
chatbot/logger.py — Structured request and error logging.

Uses Python's standard logging library so output can be redirected to a file
or a log aggregation service (e.g. CloudWatch, Datadog) with no code changes.
"""

import logging
import sys
from datetime import datetime, timezone


def _build_formatter() -> logging.Formatter:
    return logging.Formatter(
        fmt="%(asctime)s  %(levelname)-8s  %(name)s  —  %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger configured to write to stdout.

    Usage:
        from chatbot.logger import get_logger
        log = get_logger(__name__)
        log.info("request received")
    """
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(_build_formatter())
        logger.addHandler(handler)

    logger.setLevel(logging.DEBUG)
    logger.propagate = False
    return logger


def log_request(logger: logging.Logger, session_id: str, message: str) -> None:
    """Log an incoming chat request (truncated for readability)."""
    preview = message[:120].replace("\n", " ")
    logger.info(
        f"[REQUEST] session={session_id!r}  message={preview!r}"
        + ("..." if len(message) > 120 else "")
    )


def log_response(logger: logging.Logger, session_id: str, reply: str, elapsed_ms: float) -> None:
    """Log an outgoing chat response."""
    preview = reply[:120].replace("\n", " ")
    logger.info(
        f"[RESPONSE] session={session_id!r}  elapsed={elapsed_ms:.0f}ms  reply={preview!r}"
        + ("..." if len(reply) > 120 else "")
    )


def log_error(logger: logging.Logger, session_id: str, error: Exception) -> None:
    """Log an error with full traceback."""
    logger.error(
        f"[ERROR] session={session_id!r}  type={type(error).__name__}  detail={error}",
        exc_info=True,
    )
