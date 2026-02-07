"""
DET Flow - Maestro Orchestrator
Central orchestrator that coordinates all specialized agents and manages the overall workflow.
"""

from typing import Dict, Any, Optional
import logging
from datetime import datetime

from agents.evaluator import EvaluatorAgent
from agents.pedagogue import PedagogueAgent
from agents.interface import InterfaceAgent
from core.config import settings
from core.database import get_db, SessionLocal
from core.models import User, Submission, UserSession, StudyPlan

logger = logging.getLogger(__name__)


class Maestro:
    """
    Maestro - Central orchestrator for the DET Flow platform.
    Coordinates all specialized agents and manages the overall workflow.
    """

    def __init__(self):
        """Initialize the Maestro with all specialized agents."""
        self.evaluator = EvaluatorAgent()
        self.pedagogue = PedagogueAgent()
        self.interface = InterfaceAgent()

        logger.info("Maestro initialized with all agents")

    def process_user_message(
        self,
        phone_number: str,
        message: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main entry point for processing user messages from WhatsApp.

        Args:
            phone_number: User's WhatsApp phone number
            message: Message text from user
            session_id: Optional session ID for conversation continuity

        Returns:
            Dict containing response and metadata
        """
        try:
            logger.info(f"Processing message from {phone_number}")

            # Get or create user
            db = SessionLocal()
            user = self._get_or_create_user(db, phone_number)

            # Get user context
            user_context = self._build_user_context(db, user)

            # Process through Interface Agent
            interface_result = self.interface.process_message(message, user_context)

            # Route to specialized agent if needed
            if interface_result.get("requires_routing"):
                intent = interface_result.get("intent")

                if intent == "submit":
                    # Route to Evaluator
                    result = self._handle_submission(db, user, message)

                elif intent == "plan":
                    # Route to Pedagogue
                    result = self._handle_study_plan_request(db, user, message)

                elif intent == "progress":
                    # Handle progress tracking
                    result = self._handle_progress_request(db, user)

                else:
                    result = {"response": interface_result.get("response_text")}
            else:
                result = {"response": interface_result.get("response_text")}

            # Update user activity
            user.last_active = datetime.now()
            db.commit()
            db.close()

            logger.info(f"Message processed successfully for {phone_number}")
            return result

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response": "Desculpe, ocorreu um erro. Por favor, tente novamente. 🔧",
                "error": str(e)
            }

    def _get_or_create_user(self, db, phone_number: str) -> User:
        """Get existing user or create new one."""
        user = db.query(User).filter(User.phone_number == phone_number).first()

        if not user:
            user = User(
                phone_number=phone_number,
                created_at=datetime.now(),
                last_active=datetime.now()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"New user created: {phone_number}")

        return user

    def _build_user_context(self, db, user: User) -> Dict[str, Any]:
        """Build context dictionary for the user."""
        # Get recent submissions
        recent_submissions = (
            db.query(Submission)
            .filter(Submission.user_id == user.id)
            .order_by(Submission.created_at.desc())
            .limit(5)
            .all()
        )

        recent_scores = [s.overall_score for s in recent_submissions if s.overall_score]

        return {
            "user_id": user.id,
            "name": user.name,
            "current_level": user.current_level,
            "target_score": user.target_score,
            "total_submissions": user.total_submissions,
            "recent_scores": recent_scores,
            "subscription_tier": user.subscription_tier
        }

    def _handle_submission(self, db, user: User, message: str) -> Dict[str, Any]:
        """
        Handle submission evaluation workflow.

        Args:
            db: Database session
            user: User object
            message: User's submission text

        Returns:
            Dict with evaluation results and formatted response
        """
        try:
            # For now, assume the message is the response text
            # In production, you'd parse the task type and prompt
            task_type = "write_about_photo"  # Default, should be determined dynamically
            task_prompt = "Write about what you see in the photo."  # Should come from task library

            # Create submission record
            submission = Submission(
                user_id=user.id,
                task_type=task_type,
                task_prompt=task_prompt,
                response_text=message,
                status="evaluating",
                created_at=datetime.now()
            )
            db.add(submission)
            db.commit()

            # Evaluate using Evaluator Agent
            evaluation = self.evaluator.evaluate_submission(
                task_type=task_type,
                task_prompt=task_prompt,
                response_text=message,
                user_level=user.current_level
            )

            # Update submission with results
            submission.overall_score = evaluation.get("overall_score")
            submission.literacy_score = evaluation.get("subscores", {}).get("literacy")
            submission.comprehension_score = evaluation.get("subscores", {}).get("comprehension")
            submission.conversation_score = evaluation.get("subscores", {}).get("conversation")
            submission.production_score = evaluation.get("subscores", {}).get("production")
            submission.feedback = evaluation
            submission.evaluator_comments = evaluation.get("feedback")
            submission.evaluated_at = datetime.now()
            submission.evaluation_duration_ms = evaluation.get("evaluation_duration_ms")
            submission.status = "completed"

            # Update user stats
            user.total_submissions += 1

            db.commit()

            # Format response for WhatsApp
            response_text = self.interface.format_evaluation_results(evaluation)

            return {
                "response": response_text,
                "evaluation": evaluation,
                "submission_id": submission.id
            }

        except Exception as e:
            logger.error(f"Error handling submission: {e}")
            return {
                "response": "Desculpe, não consegui avaliar sua resposta. Por favor, tente novamente.",
                "error": str(e)
            }

    def _handle_study_plan_request(self, db, user: User, message: str) -> Dict[str, Any]:
        """
        Handle study plan creation workflow.

        Args:
            db: Database session
            user: User object
            message: User's request message

        Returns:
            Dict with study plan and formatted response
        """
        try:
            # Extract information from message or use defaults
            # In production, this would involve a multi-turn conversation
            current_level = user.current_level or "B1"
            target_score = user.target_score or 120
            available_hours = 10  # Default, should be asked

            # Get recent submissions to identify weaknesses
            recent_submissions = (
                db.query(Submission)
                .filter(Submission.user_id == user.id)
                .order_by(Submission.created_at.desc())
                .limit(10)
                .all()
            )

            weaknesses = []
            if recent_submissions:
                # Analyze subscores to find weaknesses
                avg_literacy = sum(s.literacy_score or 0 for s in recent_submissions) / len(recent_submissions)
                avg_comprehension = sum(s.comprehension_score or 0 for s in recent_submissions) / len(recent_submissions)
                avg_conversation = sum(s.conversation_score or 0 for s in recent_submissions) / len(recent_submissions)
                avg_production = sum(s.production_score or 0 for s in recent_submissions) / len(recent_submissions)

                if avg_literacy < 100:
                    weaknesses.append("Literacy")
                if avg_comprehension < 100:
                    weaknesses.append("Comprehension")
                if avg_conversation < 100:
                    weaknesses.append("Conversation")
                if avg_production < 100:
                    weaknesses.append("Production")

            # Generate study plan using Pedagogue Agent
            study_plan = self.pedagogue.create_study_plan(
                current_level=current_level,
                target_score=target_score,
                available_hours_per_week=available_hours,
                weaknesses=weaknesses
            )

            # Save study plan to database
            db_plan = StudyPlan(
                user_id=user.id,
                title=study_plan.get("plan_title"),
                description=f"Plano personalizado de {study_plan.get('duration_weeks')} semanas",
                plan_data=study_plan,
                duration_weeks=study_plan.get("duration_weeks"),
                created_at=datetime.now(),
                is_active=True
            )
            db.add(db_plan)
            db.commit()

            # Format response for WhatsApp
            response_text = self.interface.format_study_plan(study_plan)

            return {
                "response": response_text,
                "study_plan": study_plan,
                "plan_id": db_plan.id
            }

        except Exception as e:
            logger.error(f"Error handling study plan request: {e}")
            return {
                "response": "Desculpe, não consegui criar seu plano de estudos. Por favor, tente novamente.",
                "error": str(e)
            }

    def _handle_progress_request(self, db, user: User) -> Dict[str, Any]:
        """
        Handle progress tracking request.

        Args:
            db: Database session
            user: User object

        Returns:
            Dict with progress information and formatted response
        """
        try:
            # Get recent submissions
            submissions = (
                db.query(Submission)
                .filter(Submission.user_id == user.id)
                .order_by(Submission.created_at.desc())
                .limit(10)
                .all()
            )

            if not submissions:
                return {
                    "response": "Você ainda não tem submissões avaliadas. Envie suas primeiras respostas para começar a acompanhar seu progresso! 📊"
                }

            # Calculate statistics
            scores = [s.overall_score for s in submissions if s.overall_score]
            avg_score = sum(scores) / len(scores) if scores else 0
            max_score = max(scores) if scores else 0
            latest_score = scores[0] if scores else 0

            # Build progress message
            response = f"""📊 *Seu Progresso no DET*

📝 Total de Submissões: {len(submissions)}
📈 Pontuação Média: {avg_score:.0f}/160
🏆 Melhor Pontuação: {max_score}/160
📍 Última Pontuação: {latest_score}/160

*Últimas 5 Pontuações:*
{chr(10).join([f"  • {s.overall_score}/160 - {s.created_at.strftime('%d/%m')}" for s in submissions[:5] if s.overall_score])}

Continue praticando! 💪"""

            return {"response": response}

        except Exception as e:
            logger.error(f"Error handling progress request: {e}")
            return {
                "response": "Desculpe, não consegui carregar seu progresso. Por favor, tente novamente.",
                "error": str(e)
            }


# Create global Maestro instance
maestro = Maestro()
