"""
Resolve model identifiers to Agno/Phi model instances.
"""

from __future__ import annotations

from typing import Any


def resolve_model(model_id: str) -> Any:
    """
    Resolve a model string to a concrete model instance when Agno is available.
    Fallback to returning the raw string for Phi compatibility.
    """

    try:
        from agno.models.openai import OpenAIChat
        from agno.models.anthropic import Claude
    except Exception:
        return model_id

    openai_ids = {"gpt-4o", "gpt-4o-mini", "gpt-4-turbo-preview"}
    anthropic_ids = {"claude-3-5-sonnet", "claude-3-haiku"}

    if model_id in openai_ids:
        return OpenAIChat(id=model_id)
    if model_id in anthropic_ids:
        return Claude(id=model_id)

    return model_id
