"""
Shared helpers for extracting JSON from LLM responses.
"""

from __future__ import annotations

import json
from typing import Any, Dict


def extract_json_object(text: str) -> Dict[str, Any]:
    """
    Extract a JSON object from a response string.
    Supports raw JSON or JSON wrapped in code fences.
    """
    if not text:
        raise ValueError("Empty response")

    cleaned = text.strip()

    if "```" in cleaned:
        parts = cleaned.split("```")
        for part in parts:
            candidate = part.strip()
            if candidate.startswith("{") and candidate.endswith("}"):
                return json.loads(candidate)

    json_start = cleaned.find("{")
    json_end = cleaned.rfind("}") + 1
    if json_start != -1 and json_end > json_start:
        return json.loads(cleaned[json_start:json_end])

    raise ValueError("No JSON object found in response")


def ensure_keys(payload: Dict[str, Any], required_keys: list[str]) -> Dict[str, Any]:
    missing = [key for key in required_keys if key not in payload]
    if missing:
        raise ValueError(f"Missing required keys: {', '.join(missing)}")
    return payload
