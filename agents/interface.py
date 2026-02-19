"""
DET Flow - Interface Agent
Handles WhatsApp interactions and manages user conversations.
Routes requests to appropriate agents and formats responses for WhatsApp.
"""

from typing import Dict, Any, Optional
import logging

try:
    from agno.agent import Agent
except ImportError:
    from phi.agent import Agent

from core.config import settings
from agents.model_optimizer import ModelOptimizerAgent
from agents.model_provider import resolve_model

logger = logging.getLogger(__name__)


class InterfaceAgent:
    """
    Interface Agent - Manages user interactions via WhatsApp.
    Provides friendly, conversational interface while routing to specialized agents.
    """

    def __init__(self):
        """Initialize the Interface Agent with conversational capabilities."""

        self.system_prompt = """You are a friendly and professional DET (Duolingo English Test) Study Assistant communicating via WhatsApp.

Your role is to:
1. Greet users warmly and understand their needs
2. Guide them through the DET preparation process
3. Route their requests to the appropriate specialized agents
4. Format responses in a WhatsApp-friendly manner (concise, clear, with emojis when appropriate)
5. Maintain conversation context and provide a seamless experience

COMMUNICATION STYLE:
- Always respond in Portuguese (Brazilian Portuguese)
- Be friendly, encouraging, and supportive
- Use short paragraphs (WhatsApp-friendly formatting)
- Use emojis sparingly but effectively 📚 ✅ 💪 🎯
- Keep messages concise - avoid long walls of text
- Use line breaks for readability

CAPABILITIES:
1. **Submit Answers for Evaluation**
   - Accept text responses to DET practice tasks
   - Guide users on proper submission format
   - Route to Evaluator Agent

2. **Request Study Plans**
   - Collect information: current level, target score, available time
   - Route to Pedagogue Agent
   - Present plans in digestible chunks

3. **Track Progress**
   - Show recent scores and improvements
   - Provide motivational feedback
   - Identify patterns and trends

4. **General Help & Support**
   - Explain DET task types
   - Provide study tips
   - Answer questions about the platform

CONVERSATION FLOW:
1. Greet new users and offer main menu
2. Identify user intent (submit, plan, progress, help)
3. Collect necessary information conversationally
4. Delegate to appropriate agent
5. Format and deliver results
6. Ask if they need anything else

RESPONSE PATTERNS:

For GREETINGS:
"Olá! 👋 Bem-vindo ao DET Flow!

Sou seu assistente de preparação para o Duolingo English Test.

Como posso te ajudar hoje?
✏️ Enviar resposta para correção
📋 Criar plano de estudos
📊 Ver meu progresso
❓ Tirar dúvidas"

For SUBMISSIONS:
"Ótimo! Vou avaliar sua resposta agora... ⏳"
[After evaluation]
"Avaliação concluída! ✅

📊 Pontuação: [score]/160
📈 Nível: [CEFR]

[Brief feedback highlights]

Quer ver a análise completa?"

For STUDY PLANS:
"Vamos criar seu plano personalizado! 📚

Preciso de algumas informações:
1. Qual seu nível atual de inglês? (A1, A2, B1, B2, C1, C2)
2. Qual sua meta de pontuação no DET?
3. Quantas horas por semana você pode estudar?"

IMPORTANT:
- NEVER include raw JSON in responses to users
- Format technical information in a user-friendly way
- Always maintain a positive, encouraging tone
- Respect user privacy and data
- If unsure, ask clarifying questions
"""

        # Select model based on cost-benefit profile
        model_optimizer = ModelOptimizerAgent()
        recommendation = model_optimizer.recommend_model("chat")
        selected_model = recommendation.get("selected_model") or settings.openai_model
        model_instance = resolve_model(selected_model)

        # Initialize the Agno/Phi Agent
        self.agent = Agent(
            name="DET Interface",
            model=model_instance,
            instructions=self.system_prompt,
            markdown=False,
            debug_mode=settings.app_debug
        )

        logger.info("InterfaceAgent initialized successfully")

    def process_message(
        self,
        user_message: str,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process incoming WhatsApp message and determine appropriate response.

        Args:
            user_message: The message text from the user
            user_context: Optional context about the user and conversation history

        Returns:
            Dict containing response and routing information
        """
        try:
            # Build context for the agent
            context_info = ""
            if user_context:
                context_info = f"\n\nUSER CONTEXT:\n{self._format_context(user_context)}"

            full_prompt = f"USER MESSAGE:\n{user_message}{context_info}\n\nPlease respond appropriately and indicate if any specialized agent should be involved."

            # Get response from agent
            response = self.agent.run(full_prompt)

            # Parse response and extract routing info
            result = {
                "response_text": response.content,
                "intent": self._detect_intent(user_message),
                "requires_routing": self._should_route(user_message),
                "raw_response": response.content
            }

            logger.info(f"Processed message - Intent: {result['intent']}")
            return result

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response_text": "Desculpe, ocorreu um erro. Por favor, tente novamente em alguns instantes. 🔧",
                "intent": "error",
                "requires_routing": False,
                "error": str(e)
            }

    def format_evaluation_results(self, evaluation: Dict[str, Any]) -> str:
        """
        Format evaluation results in a WhatsApp-friendly manner.

        Args:
            evaluation: Evaluation dictionary from EvaluatorAgent

        Returns:
            Formatted message string
        """
        score = evaluation.get("overall_score", 0)
        cefr = evaluation.get("cefr_level", "B1")
        feedback = evaluation.get("feedback", "")

        subscores = evaluation.get("subscores", {})
        literacy = subscores.get("literacy", 0)
        comprehension = subscores.get("comprehension", 0)
        conversation = subscores.get("conversation", 0)
        production = subscores.get("production", 0)

        message = f"""✅ *Avaliação Concluída!*

📊 *Pontuação Geral:* {score}/160
📈 *Nível CEFR:* {cefr}

*Subscores:*
📖 Literacy: {literacy}
🧠 Comprehension: {comprehension}
💬 Conversation: {conversation}
✍️ Production: {production}

*Feedback:*
{feedback}

Quer dicas de como melhorar? Digite "dicas" 💡"""

        return message

    def format_study_plan(self, plan: Dict[str, Any], week: Optional[int] = None) -> str:
        """
        Format study plan in a WhatsApp-friendly manner.

        Args:
            plan: Study plan dictionary from PedagogueAgent
            week: Specific week to display (None = overview)

        Returns:
            Formatted message string
        """
        if week is None:
            # Overview format
            message = f"""📚 *{plan.get('plan_title', 'Seu Plano de Estudos')}*

⏱️ Duração: {plan.get('duration_weeks', 0)} semanas
🎯 Meta: {plan.get('target_score', 0)} pontos
📈 Melhoria Esperada: +{plan.get('expected_improvement', 0)} pontos

{plan.get('motivation_message', '')}

Digite o número da semana (1-{plan.get('duration_weeks', 0)}) para ver detalhes, ou "resumo" para dicas gerais."""

        else:
            # Specific week format
            weekly_schedule = plan.get('weekly_schedule', [])
            if week <= len(weekly_schedule):
                week_data = weekly_schedule[week - 1]
                focus = ", ".join(week_data.get('focus_areas', []))

                message = f"""📅 *Semana {week}*

🎯 Foco: {focus}

*Cronograma:*
"""
                for day_schedule in week_data.get('daily_tasks', [])[:3]:  # Show first 3 days
                    day = day_schedule.get('day', '')
                    duration = day_schedule.get('duration_minutes', 0)
                    message += f"\n*{day}* ({duration} min)\n"

                    for task in day_schedule.get('tasks', [])[:2]:  # Show first 2 tasks
                        message += f"  • {task.get('description', '')}\n"

                message += f"\n📝 *Checkpoint:* {week_data.get('checkpoint', '')}"
            else:
                message = "Semana inválida. Por favor, escolha um número válido."

        return message

    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format user context for the agent."""
        formatted = []
        if context.get("name"):
            formatted.append(f"Name: {context['name']}")
        if context.get("current_level"):
            formatted.append(f"Current Level: {context['current_level']}")
        if context.get("target_score"):
            formatted.append(f"Target Score: {context['target_score']}")
        if context.get("recent_scores"):
            formatted.append(f"Recent Scores: {context['recent_scores']}")

        return "\n".join(formatted) if formatted else "No context available"

    def _detect_intent(self, message: str) -> str:
        """
        Detect user intent from message.

        Returns:
            Intent category (submit, plan, progress, help, greeting, unknown)
        """
        message_lower = message.lower()

        # Keywords for different intents
        if any(word in message_lower for word in ["corrigir", "avaliar", "resposta", "submeter", "enviar"]):
            return "submit"
        elif any(word in message_lower for word in ["plano", "cronograma", "estudar", "preparar"]):
            return "plan"
        elif any(word in message_lower for word in ["progresso", "evolução", "scores", "pontuação"]):
            return "progress"
        elif any(word in message_lower for word in ["ajuda", "dúvida", "como", "o que é"]):
            return "help"
        elif any(word in message_lower for word in ["olá", "oi", "bom dia", "boa tarde", "boa noite", "hey"]):
            return "greeting"
        else:
            return "unknown"

    def _should_route(self, message: str) -> bool:
        """
        Determine if message should be routed to specialized agent.

        Returns:
            Boolean indicating if routing is needed
        """
        intent = self._detect_intent(message)
        return intent in ["submit", "plan", "progress"]
