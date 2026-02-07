"""
DET Flow - Pedagogue Agent
Creates personalized study plans and learning schedules based on student performance and goals.
"""

from typing import Dict, Any, Optional, List
import json
import logging
from datetime import datetime, timedelta

try:
    from agno import Agent
except ImportError:
    from phi.agent import Agent

from core.config import settings

logger = logging.getLogger(__name__)


class PedagogueAgent:
    """
    Pedagogue Agent - Designs personalized study plans for DET preparation.
    Takes into account current level, target score, available time, and weaknesses.
    """

    def __init__(self):
        """Initialize the Pedagogue Agent with study planning capabilities."""

        self.system_prompt = """You are an expert DET (Duolingo English Test) Study Plan Designer and Educational Strategist.

Your role is to create highly personalized, actionable study plans for students preparing for the DET exam.

CORE PRINCIPLES:
1. **Personalization**: Tailor plans to individual needs, current level, and target scores
2. **Realistic Goals**: Set achievable milestones based on available study time
3. **Balanced Approach**: Cover all four subscores (Literacy, Comprehension, Conversation, Production)
4. **Progressive Difficulty**: Start with fundamentals and gradually increase complexity
5. **Engagement**: Include variety to prevent burnout and maintain motivation

STUDY PLAN COMPONENTS:

1. **Assessment Phase** (Week 1)
   - Initial diagnostic tasks
   - Identify specific weaknesses
   - Set baseline scores

2. **Foundation Building** (Weeks 2-4)
   - Grammar fundamentals
   - Essential vocabulary (academic + everyday)
   - Basic task types practice

3. **Skill Development** (Weeks 5-8)
   - Advanced grammar structures
   - Task-specific strategies
   - Time management techniques
   - Speaking fluency exercises

4. **Intensive Practice** (Weeks 9-10)
   - Full-length practice tests
   - Weak area focus
   - Exam strategies and tips

5. **Final Preparation** (Week 11-12)
   - Mock exams under timed conditions
   - Review and consolidation
   - Confidence building

TASK TYPE COVERAGE (must include):
- Read and Complete (Literacy)
- Complete the Sentences (Comprehension)
- Read Aloud (Conversation + Production)
- Write About the Photo (Literacy + Production)
- Listen and Type (Comprehension + Literacy)
- Speak About the Photo (Conversation + Production)
- Interactive Reading (Comprehension + Literacy)
- Interactive Listening (Comprehension)

OUTPUT FORMAT:
You MUST respond with a valid JSON object:
{
  "plan_title": "<descriptive title>",
  "duration_weeks": <integer>,
  "target_score": <integer 10-160>,
  "current_level": "<CEFR level>",
  "expected_improvement": <integer points>,
  "weekly_schedule": [
    {
      "week": <integer>,
      "focus_areas": ["<area 1>", "<area 2>"],
      "daily_tasks": [
        {
          "day": "<Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday>",
          "duration_minutes": <integer>,
          "tasks": [
            {
              "task_type": "<DET task type>",
              "description": "<what to do>",
              "goal": "<specific learning objective>",
              "resources": ["<resource 1>", "<resource 2>"]
            }
          ]
        }
      ],
      "checkpoint": "<end of week assessment or milestone>"
    }
  ],
  "priority_weaknesses": ["<weakness 1>", "<weakness 2>"],
  "study_tips": ["<tip 1>", "<tip 2>", ...],
  "motivation_message": "<encouraging message in Portuguese>"
}

IMPORTANT:
- Plans should be realistic and avoid overwhelming the student
- Include rest days and review sessions
- Provide specific, actionable tasks (not vague suggestions)
- All feedback and messages should be in Portuguese
- Adapt difficulty based on current level
"""

        # Initialize the Agno/Phi Agent
        self.agent = Agent(
            name="DET Pedagogue",
            model=settings.openai_model,
            instructions=self.system_prompt,
            markdown=False,
            show_tool_calls=False,
            debug_mode=settings.app_debug
        )

        logger.info("PedagogueAgent initialized successfully")

    def create_study_plan(
        self,
        current_level: str,
        target_score: int,
        available_hours_per_week: int,
        weaknesses: Optional[List[str]] = None,
        strengths: Optional[List[str]] = None,
        deadline_weeks: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create a personalized study plan based on student profile.

        Args:
            current_level: Current CEFR level (A1, A2, B1, B2, C1, C2)
            target_score: Desired DET score (10-160)
            available_hours_per_week: Weekly study time available
            weaknesses: List of identified weak areas
            strengths: List of strong areas
            deadline_weeks: Study duration in weeks (default: calculated)

        Returns:
            Dict containing the complete study plan
        """
        try:
            # Prepare the request
            plan_request = f"""
Create a personalized DET study plan with the following profile:

STUDENT PROFILE:
- Current Level: {current_level}
- Target Score: {target_score}
- Available Study Time: {available_hours_per_week} hours per week
{f"- Weaknesses: {', '.join(weaknesses)}" if weaknesses else ""}
{f"- Strengths: {', '.join(strengths)}" if strengths else ""}
{f"- Study Duration: {deadline_weeks} weeks" if deadline_weeks else "- Study Duration: Recommend optimal duration"}

Please design a comprehensive, week-by-week study plan that will help this student achieve their target score.
Focus on addressing weaknesses while maintaining strengths.

Provide your response in the required JSON format.
"""

            logger.info(f"Generating study plan for level {current_level} targeting score {target_score}")
            response = self.agent.run(plan_request)

            # Parse the response
            study_plan = self._parse_study_plan(response.content)

            # Add metadata
            study_plan["created_at"] = datetime.now().isoformat()
            study_plan["student_profile"] = {
                "current_level": current_level,
                "target_score": target_score,
                "available_hours_per_week": available_hours_per_week,
                "weaknesses": weaknesses or [],
                "strengths": strengths or []
            }

            logger.info(f"Study plan created successfully - {study_plan.get('duration_weeks')} weeks")

            return study_plan

        except Exception as e:
            logger.error(f"Error creating study plan: {e}")
            return self._get_fallback_plan(current_level, target_score, error=str(e))

    def _parse_study_plan(self, response_content: str) -> Dict[str, Any]:
        """
        Parse the agent's response and extract the JSON study plan.

        Args:
            response_content: Raw response from the agent

        Returns:
            Parsed study plan dictionary
        """
        try:
            json_start = response_content.find("{")
            json_end = response_content.rfind("}") + 1

            if json_start != -1 and json_end > json_start:
                json_str = response_content[json_start:json_end]
                plan = json.loads(json_str)
                return plan
            else:
                raise ValueError("No JSON found in response")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON study plan: {e}")
            logger.debug(f"Raw response: {response_content}")
            raise

    def _get_fallback_plan(self, current_level: str, target_score: int, error: str = "") -> Dict[str, Any]:
        """
        Generate a basic fallback study plan when the main generation fails.

        Args:
            current_level: Student's current level
            target_score: Target score
            error: Error message

        Returns:
            Basic study plan dictionary
        """
        return {
            "plan_title": f"Plano de Estudos DET - {current_level} para {target_score}",
            "duration_weeks": 8,
            "target_score": target_score,
            "current_level": current_level,
            "expected_improvement": 20,
            "weekly_schedule": [],
            "priority_weaknesses": [],
            "study_tips": [
                "Pratique diariamente, mesmo que por pouco tempo",
                "Foque em suas áreas mais fracas",
                "Faça simulados semanais para acompanhar seu progresso"
            ],
            "motivation_message": "Desculpe, ocorreu um erro ao gerar seu plano personalizado. Entre em contato com o suporte.",
            "error": error
        }

    def adjust_plan_based_on_progress(
        self,
        original_plan: Dict[str, Any],
        recent_scores: List[int],
        completed_weeks: int
    ) -> Dict[str, Any]:
        """
        Adjust an existing study plan based on student progress.

        Args:
            original_plan: The original study plan
            recent_scores: List of recent submission scores
            completed_weeks: Number of weeks completed

        Returns:
            Adjusted study plan
        """
        try:
            adjustment_request = f"""
Adjust this study plan based on student progress:

ORIGINAL PLAN:
{json.dumps(original_plan, indent=2)}

PROGRESS DATA:
- Completed Weeks: {completed_weeks}
- Recent Scores: {recent_scores}
- Average Score: {sum(recent_scores) / len(recent_scores) if recent_scores else 'N/A'}

Please adjust the remaining weeks of the plan to better match the student's actual progress.
If they're ahead of schedule, increase difficulty. If behind, add more foundational practice.

Provide the adjusted plan in JSON format.
"""

            response = self.agent.run(adjustment_request)
            adjusted_plan = self._parse_study_plan(response.content)

            logger.info("Study plan adjusted based on progress")
            return adjusted_plan

        except Exception as e:
            logger.error(f"Error adjusting study plan: {e}")
            return original_plan  # Return original if adjustment fails
