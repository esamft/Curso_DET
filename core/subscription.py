"""
DET Flow - Subscription Management
Handles weekly subscriptions and access control.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class SubscriptionStatus(str, Enum):
    """Subscription status enumeration."""
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PENDING = "pending"
    TRIAL = "trial"


class SubscriptionPlan(str, Enum):
    """Available subscription plans."""
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


# Pricing in BRL (Brazilian Real)
PLAN_PRICING = {
    SubscriptionPlan.WEEKLY: {
        "price": 29.90,
        "duration_days": 7,
        "name": "Plano Semanal",
        "description": "Acesso por 7 dias ao DET Flow"
    },
    SubscriptionPlan.MONTHLY: {
        "price": 99.90,
        "duration_days": 30,
        "name": "Plano Mensal",
        "description": "Acesso por 30 dias ao DET Flow"
    },
    SubscriptionPlan.YEARLY: {
        "price": 997.00,
        "duration_days": 365,
        "name": "Plano Anual",
        "description": "Acesso por 1 ano ao DET Flow"
    }
}


class SubscriptionManager:
    """Manages user subscriptions and access control."""

    def __init__(self):
        """Initialize the subscription manager."""
        pass

    def has_active_subscription(
        self,
        subscription_end_date: Optional[datetime],
        subscription_status: str
    ) -> bool:
        """
        Check if a user has an active subscription.

        Args:
            subscription_end_date: When the subscription ends
            subscription_status: Current subscription status

        Returns:
            True if subscription is active, False otherwise
        """
        if not subscription_end_date or subscription_status != SubscriptionStatus.ACTIVE:
            return False

        return datetime.now() < subscription_end_date

    def calculate_subscription_end_date(
        self,
        plan: SubscriptionPlan,
        start_date: Optional[datetime] = None
    ) -> datetime:
        """
        Calculate the end date for a subscription.

        Args:
            plan: Subscription plan type
            start_date: Start date (defaults to now)

        Returns:
            End date of the subscription
        """
        if start_date is None:
            start_date = datetime.now()

        duration_days = PLAN_PRICING[plan]["duration_days"]
        end_date = start_date + timedelta(days=duration_days)

        return end_date

    def get_plan_details(self, plan: SubscriptionPlan) -> Dict:
        """
        Get details for a subscription plan.

        Args:
            plan: Subscription plan type

        Returns:
            Dictionary with plan details
        """
        return PLAN_PRICING.get(plan, {})

    def get_all_plans(self) -> Dict[str, Dict]:
        """
        Get all available subscription plans.

        Returns:
            Dictionary of all plans with their details
        """
        return PLAN_PRICING

    def days_remaining(self, subscription_end_date: Optional[datetime]) -> int:
        """
        Calculate days remaining in subscription.

        Args:
            subscription_end_date: When the subscription ends

        Returns:
            Number of days remaining (0 if expired or None)
        """
        if not subscription_end_date:
            return 0

        delta = subscription_end_date - datetime.now()
        return max(0, delta.days)

    def extend_subscription(
        self,
        current_end_date: Optional[datetime],
        plan: SubscriptionPlan
    ) -> datetime:
        """
        Extend an existing subscription.

        Args:
            current_end_date: Current subscription end date
            plan: Plan to extend with

        Returns:
            New end date
        """
        # If subscription already expired, start from now
        if not current_end_date or current_end_date < datetime.now():
            start_date = datetime.now()
        else:
            # Otherwise, extend from current end date
            start_date = current_end_date

        return self.calculate_subscription_end_date(plan, start_date)

    def cancel_subscription(self) -> Dict:
        """
        Process subscription cancellation.

        Returns:
            Status information
        """
        return {
            "status": SubscriptionStatus.CANCELLED,
            "message": "Assinatura cancelada. O acesso permanece ativo até o fim do período pago."
        }

    def grant_trial(self, trial_days: int = 3) -> datetime:
        """
        Grant a trial period.

        Args:
            trial_days: Number of trial days

        Returns:
            Trial end date
        """
        return datetime.now() + timedelta(days=trial_days)

    def is_trial_eligible(self, user_created_at: datetime) -> bool:
        """
        Check if user is eligible for trial.

        Args:
            user_created_at: When the user was created

        Returns:
            True if eligible for trial
        """
        # Trial only available within 24 hours of registration
        hours_since_registration = (datetime.now() - user_created_at).total_seconds() / 3600
        return hours_since_registration <= 24

    def format_subscription_message(
        self,
        status: str,
        end_date: Optional[datetime],
        plan: Optional[str] = None
    ) -> str:
        """
        Format a user-friendly subscription status message.

        Args:
            status: Subscription status
            end_date: Subscription end date
            plan: Plan type

        Returns:
            Formatted message in Portuguese
        """
        if status == SubscriptionStatus.ACTIVE and end_date:
            days_left = self.days_remaining(end_date)
            return f"✅ Assinatura Ativa - {days_left} dias restantes"

        elif status == SubscriptionStatus.EXPIRED:
            return "⚠️ Assinatura Expirada - Renove para continuar"

        elif status == SubscriptionStatus.CANCELLED:
            if end_date and end_date > datetime.now():
                days_left = self.days_remaining(end_date)
                return f"🔔 Assinatura Cancelada - Acesso até {end_date.strftime('%d/%m/%Y')} ({days_left} dias)"
            return "❌ Assinatura Cancelada"

        elif status == SubscriptionStatus.PENDING:
            return "⏳ Pagamento Pendente - Aguardando confirmação"

        elif status == SubscriptionStatus.TRIAL:
            if end_date:
                days_left = self.days_remaining(end_date)
                return f"🎁 Período de Teste - {days_left} dias restantes"
            return "🎁 Período de Teste"

        return "❓ Status Desconhecido"


# Global subscription manager instance
subscription_manager = SubscriptionManager()
