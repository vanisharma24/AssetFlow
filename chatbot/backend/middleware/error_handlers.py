"""
middleware/error_handlers.py — Global HTTP error handlers.

Registered once in the app factory so every unhandled exception returns
a consistent JSON error shape instead of an HTML Flask error page.
"""

import traceback

from flask import Flask, jsonify

from chatbot.logger import get_logger

log = get_logger(__name__)


def register_error_handlers(app: Flask) -> None:
    """Attach all error handlers to the Flask app instance."""

    @app.errorhandler(400)
    def bad_request(exc):
        return jsonify({"error": "Bad request", "status": 400}), 400

    @app.errorhandler(404)
    def not_found(exc):
        return jsonify({"error": "Endpoint not found", "status": 404}), 404

    @app.errorhandler(405)
    def method_not_allowed(exc):
        return jsonify({"error": "Method not allowed", "status": 405}), 405

    @app.errorhandler(429)
    def rate_limited(exc):
        return (
            jsonify({"error": "Too many requests — please slow down", "status": 429}),
            429,
        )

    @app.errorhandler(500)
    def internal_error(exc):
        log.error(f"Unhandled 500 error: {exc}\n{traceback.format_exc()}")
        return (
            jsonify(
                {
                    "error": "Internal server error — please try again later",
                    "status": 500,
                }
            ),
            500,
        )

    @app.errorhandler(Exception)
    def unhandled_exception(exc):
        log.error(f"Unhandled exception: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        return (
            jsonify(
                {
                    "error": "An unexpected error occurred",
                    "status": 500,
                }
            ),
            500,
        )
