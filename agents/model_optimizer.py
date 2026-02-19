"""
DET Flow - Model Optimizer Agent
Selects the best cost-benefit model per activity using a weighted heuristic.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import json
import os
import logging

logger = logging.getLogger(__name__)


class ModelOptimizerAgent:
    """
    Model Optimizer Agent - Recommends the best model per activity.
    It uses a configurable catalog with relative tiers for cost, quality, and latency.
    """

    def __init__(self, catalog: Optional[List[Dict[str, Any]]] = None):
        self.catalog = catalog or self._load_catalog()
        self.activity_profiles = self._activity_profiles()
        logger.info("ModelOptimizerAgent initialized successfully")

    def recommend_model(
        self,
        activity: str,
        requirements: Optional[Dict[str, Any]] = None,
        candidate_models: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        requirements = requirements or {}
        override_model = self._get_activity_override(activity)
        if override_model:
            return {
                "activity": activity,
                "selected_model": override_model,
                "score": 0.0,
                "score_breakdown": {},
                "alternatives": [],
                "rationale": "Modelo forçado via variavel de ambiente.",
                "assumptions": [],
                "notes": [f"Override aplicado: {override_model}"],
            }

        catalog = candidate_models or self.catalog
        if not catalog:
            return self._error_result(
                activity,
                "Catalogo de modelos vazio. Defina MODEL_CATALOG_JSON ou passe candidate_models.",
            )

        profile = self._build_profile(activity, requirements)
        ranked = self._rank_models(catalog, profile)

        best = ranked[0]
        alternatives = ranked[1:4]

        return {
            "activity": activity,
            "selected_model": best["model"],
            "score": best["score"],
            "score_breakdown": best["score_breakdown"],
            "alternatives": [
                {
                    "model": item["model"],
                    "score": item["score"],
                    "reason": item["reason"],
                }
                for item in alternatives
            ],
            "rationale": best["reason"],
            "assumptions": profile["assumptions"],
            "notes": profile["notes"],
        }

    def _build_profile(self, activity: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        profile = self.activity_profiles.get(activity, self.activity_profiles["default"]).copy()
        profile = self._apply_profile_env_overrides(activity, profile)

        profile["quality_priority"] = requirements.get("quality_priority", profile["quality_priority"])
        profile["cost_priority"] = requirements.get("cost_priority", profile["cost_priority"])
        profile["latency_priority"] = requirements.get("latency_priority", profile["latency_priority"])

        min_quality = requirements.get("min_quality_tier", profile.get("constraints", {}).get("min_quality_tier"))
        max_cost = requirements.get("max_cost_tier", profile.get("constraints", {}).get("max_cost_tier"))
        max_latency = requirements.get("max_latency_tier", profile.get("constraints", {}).get("max_latency_tier"))

        profile["constraints"] = {
            "min_quality_tier": min_quality,
            "max_cost_tier": max_cost,
            "max_latency_tier": max_latency,
        }

        profile["assumptions"].extend(requirements.get("assumptions", []))
        profile["notes"].extend(requirements.get("notes", []))

        return profile

    def _rank_models(self, catalog: List[Dict[str, Any]], profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        ranked: List[Dict[str, Any]] = []

        for model in catalog:
            if not self._passes_constraints(model, profile["constraints"]):
                continue

            score, breakdown = self._score_model(model, profile)
            reason = self._build_reason(model, breakdown, profile)
            ranked.append(
                {
                    "model": model["id"],
                    "score": score,
                    "score_breakdown": breakdown,
                    "reason": reason,
                }
            )

        if not ranked:
            fallback = self._fallback_result(profile)
            return [fallback]

        ranked.sort(key=lambda item: item["score"], reverse=True)
        return ranked

    def _score_model(self, model: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, Dict[str, float]]:
        quality = float(model.get("quality_tier", 3))
        cost = float(model.get("cost_tier", 3))
        latency = float(model.get("latency_tier", 3))

        quality_weight = profile["quality_priority"]
        cost_weight = profile["cost_priority"]
        latency_weight = profile["latency_priority"]

        cost_score = 6 - cost
        latency_score = 6 - latency

        total = (
            quality_weight * quality
            + cost_weight * cost_score
            + latency_weight * latency_score
        )

        breakdown = {
            "quality": quality,
            "cost": cost_score,
            "latency": latency_score,
            "weights": {
                "quality": quality_weight,
                "cost": cost_weight,
                "latency": latency_weight,
            },
        }

        return total, breakdown

    def _passes_constraints(self, model: Dict[str, Any], constraints: Dict[str, Any]) -> bool:
        min_quality = constraints.get("min_quality_tier")
        max_cost = constraints.get("max_cost_tier")
        max_latency = constraints.get("max_latency_tier")

        if min_quality is not None and model.get("quality_tier", 3) < min_quality:
            return False
        if max_cost is not None and model.get("cost_tier", 3) > max_cost:
            return False
        if max_latency is not None and model.get("latency_tier", 3) > max_latency:
            return False

        return True

    def _build_reason(
        self,
        model: Dict[str, Any],
        breakdown: Dict[str, Any],
        profile: Dict[str, Any],
    ) -> str:
        strengths = model.get("strengths", [])
        strengths_text = ", ".join(strengths) if strengths else "equilibrio geral"
        return (
            f"Bom custo-beneficio para {profile['label']}; "
            f"qualidade {breakdown['quality']}/5, "
            f"custo relativo {breakdown['cost']}/5, "
            f"latencia {breakdown['latency']}/5; "
            f"destaques: {strengths_text}."
        )

    def _fallback_result(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "model": "gpt-4-turbo-preview",
            "score": 0.0,
            "score_breakdown": {},
            "reason": (
                "Nenhum modelo atendeu as restricoes. "
                "Usando fallback padrao para evitar bloqueio."
            ),
        }

    def _error_result(self, activity: str, message: str) -> Dict[str, Any]:
        return {
            "activity": activity,
            "selected_model": None,
            "score": 0.0,
            "score_breakdown": {},
            "alternatives": [],
            "rationale": message,
            "assumptions": [],
            "notes": [],
        }

    def _load_catalog(self) -> List[Dict[str, Any]]:
        env_catalog = os.getenv("MODEL_CATALOG_JSON")
        if env_catalog:
            try:
                parsed = json.loads(env_catalog)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError as exc:
                logger.warning(f"MODEL_CATALOG_JSON invalido: {exc}")

        return self._default_catalog()

    def _get_activity_override(self, activity: str) -> Optional[str]:
        key = f"MODEL_OVERRIDE_{activity.upper()}"
        value = os.getenv(key)
        return value.strip() if value else None

    def _apply_profile_env_overrides(self, activity: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        weights_json = os.getenv("MODEL_WEIGHTS_JSON")
        constraints_json = os.getenv("MODEL_CONSTRAINTS_JSON")

        if weights_json:
            try:
                weights = json.loads(weights_json)
                activity_weights = weights.get(activity) or weights.get("default")
                if isinstance(activity_weights, dict):
                    profile["quality_priority"] = activity_weights.get(
                        "quality_priority", profile["quality_priority"]
                    )
                    profile["cost_priority"] = activity_weights.get(
                        "cost_priority", profile["cost_priority"]
                    )
                    profile["latency_priority"] = activity_weights.get(
                        "latency_priority", profile["latency_priority"]
                    )
            except json.JSONDecodeError as exc:
                logger.warning(f"MODEL_WEIGHTS_JSON invalido: {exc}")

        if constraints_json:
            try:
                constraints = json.loads(constraints_json)
                activity_constraints = constraints.get(activity) or constraints.get("default")
                if isinstance(activity_constraints, dict):
                    profile["constraints"] = {
                        "min_quality_tier": activity_constraints.get("min_quality_tier"),
                        "max_cost_tier": activity_constraints.get("max_cost_tier"),
                        "max_latency_tier": activity_constraints.get("max_latency_tier"),
                    }
            except json.JSONDecodeError as exc:
                logger.warning(f"MODEL_CONSTRAINTS_JSON invalido: {exc}")

        return profile

    def _default_catalog(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "gpt-4o-mini",
                "provider": "openai",
                "quality_tier": 3,
                "cost_tier": 1,
                "latency_tier": 2,
                "strengths": ["baixo custo", "baixa latencia", "tarefas simples"],
            },
            {
                "id": "gpt-4o",
                "provider": "openai",
                "quality_tier": 5,
                "cost_tier": 3,
                "latency_tier": 2,
                "strengths": ["alta qualidade", "boa latencia", "uso geral"],
            },
            {
                "id": "gpt-4-turbo-preview",
                "provider": "openai",
                "quality_tier": 5,
                "cost_tier": 4,
                "latency_tier": 3,
                "strengths": ["alta qualidade", "razoavel para analise longa"],
            },
            {
                "id": "claude-3-5-sonnet",
                "provider": "anthropic",
                "quality_tier": 5,
                "cost_tier": 4,
                "latency_tier": 3,
                "strengths": ["qualidade alta", "boa redacao"],
            },
            {
                "id": "claude-3-haiku",
                "provider": "anthropic",
                "quality_tier": 3,
                "cost_tier": 1,
                "latency_tier": 2,
                "strengths": ["baixo custo", "respostas rapidas"],
            },
        ]

    def _activity_profiles(self) -> Dict[str, Dict[str, Any]]:
        return {
            "evaluation": {
                "label": "avaliacao de respostas DET",
                "quality_priority": 5,
                "cost_priority": 2,
                "latency_priority": 2,
                "assumptions": ["precisao tem prioridade alta"],
                "notes": ["usar modelos mais fortes para avaliacao justa"],
            },
            "study_plan": {
                "label": "criacao de plano de estudos",
                "quality_priority": 4,
                "cost_priority": 3,
                "latency_priority": 2,
                "assumptions": ["qualidade e coerencia sao importantes"],
                "notes": [],
            },
            "chat": {
                "label": "conversa no WhatsApp",
                "quality_priority": 3,
                "cost_priority": 4,
                "latency_priority": 4,
                "assumptions": ["respostas rapidas melhoram a experiencia"],
                "notes": [],
            },
            "summarization": {
                "label": "resumo e organizacao de texto",
                "quality_priority": 3,
                "cost_priority": 4,
                "latency_priority": 3,
                "assumptions": ["tarefas de resumo toleram modelos mais baratos"],
                "notes": [],
            },
            "default": {
                "label": "tarefa geral",
                "quality_priority": 4,
                "cost_priority": 3,
                "latency_priority": 3,
                "assumptions": [],
                "notes": [],
            },
        }
