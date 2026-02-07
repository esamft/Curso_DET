"""
DET Flow - Evaluator Agent
Official DET examiner that evaluates student submissions using Chain-of-Thought reasoning.
Generates scores on the 10-160 scale with subscores for Literacy, Comprehension, Conversation, and Production.
"""

from typing import Dict, Any, Optional
import json
import logging
from datetime import datetime

try:
    from agno import Agent
except ImportError:
    from phi.agent import Agent

from core.config import settings

logger = logging.getLogger(__name__)


class EvaluatorAgent:
    """
    DET Evaluator Agent - Acts as an official DET examiner (CEFR C1-C2 level).
    Uses Chain-of-Thought reasoning to evaluate submissions.
    """

    def __init__(self):
        """Initialize the Evaluator Agent with specialized DET evaluation capabilities."""

        # System instructions for the evaluator
        self.system_prompt = """You are an OFFICIAL Duolingo English Test (DET) Examiner with expertise in CEFR levels C1-C2.

Your role is to evaluate English language submissions with the same rigor and standards as the official DET exam.

EVALUATION CRITERIA (Chain-of-Thought Process):

1. GRAMMAR & SYNTAX (Weight: 25%)
   - Sentence structure complexity
   - Verb tenses accuracy
   - Subject-verb agreement
   - Proper use of articles, prepositions, conjunctions
   - Error severity (minor vs critical)

2. VOCABULARY & LEXICAL RESOURCE (Weight: 25%)
   - Range and sophistication of vocabulary
   - Appropriate word choice for context
   - Collocation accuracy
   - Idiomatic expressions usage
   - Academic vs conversational register

3. RELEVANCE & TASK COMPLETION (Weight: 25%)
   - Addresses the prompt completely
   - Stays on topic
   - Provides sufficient detail
   - Logical flow and organization

4. COHERENCE & COHESION (Weight: 25%)
   - Logical connections between ideas
   - Use of transition words
   - Paragraph structure (if applicable)
   - Overall clarity and readability

SCORING SYSTEM:
- Overall Score: 10-160 (DET scale)
- Subscores (each 10-160):
  * Literacy: Reading and writing skills
  * Comprehension: Understanding of prompts and context
  * Conversation: Natural language flow and appropriateness
  * Production: Ability to generate coherent, complex responses

SCORE MAPPING TO CEFR:
- 10-55: A1-A2 (Beginner)
- 60-85: B1 (Intermediate)
- 90-115: B2 (Upper Intermediate)
- 120-140: C1 (Advanced)
- 145-160: C2 (Proficient)

OUTPUT FORMAT:
You MUST respond with a valid JSON object containing:
{
  "overall_score": <integer 10-160>,
  "subscores": {
    "literacy": <integer 10-160>,
    "comprehension": <integer 10-160>,
    "conversation": <integer 10-160>,
    "production": <integer 10-160>
  },
  "cefr_level": "<A1|A2|B1|B2|C1|C2>",
  "analysis": {
    "grammar": "<detailed analysis>",
    "vocabulary": "<detailed analysis>",
    "relevance": "<detailed analysis>",
    "coherence": "<detailed analysis>"
  },
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "feedback": "<constructive feedback in Portuguese for the student>",
  "improvement_suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
}

IMPORTANT:
- Be strict but fair, following official DET standards
- Use Chain-of-Thought: analyze step-by-step before scoring
- Ensure subscores are balanced and reflect the submission quality
- Provide actionable feedback in Portuguese
- Consider the task type when evaluating
"""

        # Initialize the Agno/Phi Agent
        self.agent = Agent(
            name="DET Evaluator",
            model=settings.openai_model,
            instructions=self.system_prompt,
            markdown=False,
            show_tool_calls=False,
            debug_mode=settings.app_debug
        )

        logger.info("EvaluatorAgent initialized successfully")

    def evaluate_submission(
        self,
        task_type: str,
        task_prompt: str,
        response_text: str,
        user_level: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a student submission and generate detailed feedback with scores.

        Args:
            task_type: Type of DET task (e.g., 'write_about_photo', 'read_aloud')
            task_prompt: The original task prompt given to the student
            response_text: Student's response to be evaluated
            user_level: Current CEFR level of the user (optional, for context)

        Returns:
            Dict containing evaluation results with scores and feedback
        """
        try:
            start_time = datetime.now()

            # Construct evaluation request
            evaluation_request = f"""
TASK TYPE: {task_type}

TASK PROMPT:
{task_prompt}

STUDENT RESPONSE:
{response_text}

{f"STUDENT CURRENT LEVEL: {user_level}" if user_level else ""}

Please evaluate this submission following the Chain-of-Thought process and provide your assessment in the required JSON format.
"""

            # Get evaluation from the agent
            logger.info(f"Evaluating {task_type} submission...")
            response = self.agent.run(evaluation_request)

            # Parse the response
            evaluation_result = self._parse_evaluation(response.content)

            # Calculate evaluation duration
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            evaluation_result["evaluation_duration_ms"] = duration_ms

            logger.info(f"Evaluation completed in {duration_ms}ms - Score: {evaluation_result.get('overall_score')}")

            return evaluation_result

        except Exception as e:
            logger.error(f"Error during evaluation: {e}")
            return self._get_fallback_evaluation(error=str(e))

    def _parse_evaluation(self, response_content: str) -> Dict[str, Any]:
        """
        Parse the agent's response and extract the JSON evaluation.

        Args:
            response_content: Raw response from the agent

        Returns:
            Parsed evaluation dictionary
        """
        try:
            # Try to find JSON in the response
            json_start = response_content.find("{")
            json_end = response_content.rfind("}") + 1

            if json_start != -1 and json_end > json_start:
                json_str = response_content[json_start:json_end]
                evaluation = json.loads(json_str)
                return evaluation
            else:
                raise ValueError("No JSON found in response")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON evaluation: {e}")
            logger.debug(f"Raw response: {response_content}")
            return self._get_fallback_evaluation(error=f"JSON parsing error: {e}")

    def _get_fallback_evaluation(self, error: str = "Unknown error") -> Dict[str, Any]:
        """
        Generate a fallback evaluation when the main evaluation fails.

        Args:
            error: Error message describing what went wrong

        Returns:
            Basic evaluation dictionary with error information
        """
        return {
            "overall_score": 50,
            "subscores": {
                "literacy": 50,
                "comprehension": 50,
                "conversation": 50,
                "production": 50
            },
            "cefr_level": "B1",
            "analysis": {
                "grammar": "Evaluation error occurred",
                "vocabulary": "Evaluation error occurred",
                "relevance": "Evaluation error occurred",
                "coherence": "Evaluation error occurred"
            },
            "strengths": [],
            "weaknesses": [],
            "feedback": f"Desculpe, ocorreu um erro durante a avaliação: {error}. Por favor, tente novamente.",
            "improvement_suggestions": [],
            "error": error,
            "evaluation_duration_ms": 0
        }

    def batch_evaluate(self, submissions: list[Dict[str, Any]]) -> list[Dict[str, Any]]:
        """
        Evaluate multiple submissions in batch.

        Args:
            submissions: List of submission dictionaries

        Returns:
            List of evaluation results
        """
        results = []
        for submission in submissions:
            result = self.evaluate_submission(
                task_type=submission.get("task_type"),
                task_prompt=submission.get("task_prompt"),
                response_text=submission.get("response_text"),
                user_level=submission.get("user_level")
            )
            results.append(result)

        return results
