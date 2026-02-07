"""
DET Flow - Agent Tests
Unit tests for all specialized agents.
"""

import pytest
from agents.evaluator import EvaluatorAgent
from agents.pedagogue import PedagogueAgent
from agents.interface import InterfaceAgent


class TestEvaluatorAgent:
    """Tests for the Evaluator Agent."""

    @pytest.fixture
    def evaluator(self):
        """Create an EvaluatorAgent instance."""
        return EvaluatorAgent()

    def test_evaluator_initialization(self, evaluator):
        """Test that evaluator initializes correctly."""
        assert evaluator is not None
        assert evaluator.agent is not None

    def test_evaluate_submission(self, evaluator):
        """Test submission evaluation."""
        result = evaluator.evaluate_submission(
            task_type="write_about_photo",
            task_prompt="Describe what you see in the photo.",
            response_text="In this photo, I can see a beautiful landscape with mountains and a lake.",
            user_level="B1"
        )

        assert result is not None
        assert "overall_score" in result
        assert "subscores" in result
        assert "feedback" in result
        assert 10 <= result["overall_score"] <= 160

    def test_fallback_evaluation(self, evaluator):
        """Test fallback evaluation on error."""
        fallback = evaluator._get_fallback_evaluation("Test error")

        assert fallback["overall_score"] == 50
        assert "error" in fallback
        assert fallback["error"] == "Test error"


class TestPedagogueAgent:
    """Tests for the Pedagogue Agent."""

    @pytest.fixture
    def pedagogue(self):
        """Create a PedagogueAgent instance."""
        return PedagogueAgent()

    def test_pedagogue_initialization(self, pedagogue):
        """Test that pedagogue initializes correctly."""
        assert pedagogue is not None
        assert pedagogue.agent is not None

    def test_create_study_plan(self, pedagogue):
        """Test study plan creation."""
        plan = pedagogue.create_study_plan(
            current_level="B1",
            target_score=120,
            available_hours_per_week=10,
            weaknesses=["Grammar", "Vocabulary"]
        )

        assert plan is not None
        assert "plan_title" in plan
        assert "duration_weeks" in plan
        assert "weekly_schedule" in plan or "error" in plan

    def test_fallback_plan(self, pedagogue):
        """Test fallback plan generation."""
        fallback = pedagogue._get_fallback_plan("B1", 120, "Test error")

        assert fallback["current_level"] == "B1"
        assert fallback["target_score"] == 120
        assert "error" in fallback


class TestInterfaceAgent:
    """Tests for the Interface Agent."""

    @pytest.fixture
    def interface(self):
        """Create an InterfaceAgent instance."""
        return InterfaceAgent()

    def test_interface_initialization(self, interface):
        """Test that interface initializes correctly."""
        assert interface is not None
        assert interface.agent is not None

    def test_process_message(self, interface):
        """Test message processing."""
        result = interface.process_message(
            user_message="Olá, quero praticar!",
            user_context={"name": "João", "current_level": "B1"}
        )

        assert result is not None
        assert "response_text" in result
        assert "intent" in result

    def test_detect_intent(self, interface):
        """Test intent detection."""
        assert interface._detect_intent("Quero enviar uma resposta") == "submit"
        assert interface._detect_intent("Preciso de um plano de estudos") == "plan"
        assert interface._detect_intent("Como está meu progresso?") == "progress"
        assert interface._detect_intent("Olá!") == "greeting"

    def test_format_evaluation_results(self, interface):
        """Test evaluation results formatting."""
        evaluation = {
            "overall_score": 120,
            "cefr_level": "B2",
            "subscores": {
                "literacy": 115,
                "comprehension": 120,
                "conversation": 125,
                "production": 120
            },
            "feedback": "Bom trabalho! Continue praticando."
        }

        formatted = interface.format_evaluation_results(evaluation)

        assert "120/160" in formatted
        assert "B2" in formatted
        assert formatted is not None
        assert len(formatted) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
