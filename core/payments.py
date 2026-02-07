"""
DET Flow - Payment Processing with Mercado Pago
Handles PIX and credit card payments for subscriptions.
"""

from typing import Dict, Any, Optional
import logging
import httpx
from datetime import datetime

from core.config import settings
from core.subscription import SubscriptionPlan, PLAN_PRICING

logger = logging.getLogger(__name__)


class MercadoPagoError(Exception):
    """Exception raised for Mercado Pago API errors."""
    pass


class PaymentProcessor:
    """Handles payment processing with Mercado Pago."""

    def __init__(self):
        """Initialize the payment processor."""
        # These should be added to settings
        self.access_token = getattr(settings, 'mercado_pago_access_token', None)
        self.base_url = "https://api.mercadopago.com/v1"

        if not self.access_token:
            logger.warning("Mercado Pago access token not configured")

    async def create_payment_preference(
        self,
        user_id: int,
        user_email: str,
        plan: SubscriptionPlan,
        user_phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a payment preference (checkout) for Mercado Pago.

        Args:
            user_id: User ID
            user_email: User email
            plan: Subscription plan
            user_phone: User phone number (optional)

        Returns:
            Payment preference data with init_point (checkout URL)
        """
        try:
            plan_details = PLAN_PRICING[plan]

            # Prepare payment data
            preference_data = {
                "items": [
                    {
                        "id": f"det_flow_{plan}",
                        "title": plan_details["name"],
                        "description": plan_details["description"],
                        "quantity": 1,
                        "currency_id": "BRL",
                        "unit_price": plan_details["price"]
                    }
                ],
                "payer": {
                    "email": user_email,
                },
                "back_urls": {
                    "success": f"{settings.app_host}/payment/success",
                    "failure": f"{settings.app_host}/payment/failure",
                    "pending": f"{settings.app_host}/payment/pending"
                },
                "auto_return": "approved",
                "notification_url": f"{settings.app_host}/api/payments/webhook",
                "external_reference": f"user_{user_id}_plan_{plan}",
                "statement_descriptor": "DET FLOW",
                "payment_methods": {
                    "excluded_payment_methods": [],
                    "excluded_payment_types": [],
                    "installments": 1  # No installments for weekly plans
                }
            }

            # Add phone if provided
            if user_phone:
                preference_data["payer"]["phone"] = {
                    "number": user_phone.replace("+", "")
                }

            # Make API request
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/checkout/preferences",
                    json=preference_data,
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json"
                    }
                )

                if response.status_code != 201:
                    logger.error(f"Mercado Pago API error: {response.text}")
                    raise MercadoPagoError(f"Failed to create payment preference: {response.text}")

                return response.json()

        except Exception as e:
            logger.error(f"Error creating payment preference: {e}")
            raise

    async def create_pix_payment(
        self,
        user_id: int,
        user_email: str,
        plan: SubscriptionPlan,
        user_name: Optional[str] = None,
        user_cpf: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a PIX payment.

        Args:
            user_id: User ID
            user_email: User email
            plan: Subscription plan
            user_name: User full name (required for PIX)
            user_cpf: User CPF (required for PIX)

        Returns:
            Payment data with PIX QR code and transaction ID
        """
        try:
            plan_details = PLAN_PRICING[plan]

            payment_data = {
                "transaction_amount": plan_details["price"],
                "description": plan_details["description"],
                "payment_method_id": "pix",
                "payer": {
                    "email": user_email,
                },
                "external_reference": f"user_{user_id}_plan_{plan}",
                "notification_url": f"{settings.app_host}/api/payments/webhook"
            }

            # Add name and CPF if provided (required for PIX)
            if user_name:
                payment_data["payer"]["first_name"] = user_name.split()[0]
                if len(user_name.split()) > 1:
                    payment_data["payer"]["last_name"] = " ".join(user_name.split()[1:])

            if user_cpf:
                payment_data["payer"]["identification"] = {
                    "type": "CPF",
                    "number": user_cpf.replace(".", "").replace("-", "")
                }

            # Make API request
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/payments",
                    json=payment_data,
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json",
                        "X-Idempotency-Key": f"pix_{user_id}_{plan}_{datetime.now().timestamp()}"
                    }
                )

                if response.status_code not in [200, 201]:
                    logger.error(f"Mercado Pago PIX error: {response.text}")
                    raise MercadoPagoError(f"Failed to create PIX payment: {response.text}")

                payment_response = response.json()

                # Extract PIX information
                return {
                    "payment_id": payment_response["id"],
                    "status": payment_response["status"],
                    "qr_code": payment_response["point_of_interaction"]["transaction_data"]["qr_code"],
                    "qr_code_base64": payment_response["point_of_interaction"]["transaction_data"]["qr_code_base64"],
                    "ticket_url": payment_response.get("transaction_details", {}).get("external_resource_url"),
                    "amount": payment_response["transaction_amount"],
                    "expiration_date": payment_response.get("date_of_expiration")
                }

        except Exception as e:
            logger.error(f"Error creating PIX payment: {e}")
            raise

    async def check_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Check the status of a payment.

        Args:
            payment_id: Mercado Pago payment ID

        Returns:
            Payment status information
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/payments/{payment_id}",
                    headers={"Authorization": f"Bearer {self.access_token}"}
                )

                if response.status_code != 200:
                    logger.error(f"Error checking payment status: {response.text}")
                    raise MercadoPagoError(f"Failed to check payment: {response.text}")

                payment_data = response.json()

                return {
                    "payment_id": payment_data["id"],
                    "status": payment_data["status"],
                    "status_detail": payment_data["status_detail"],
                    "amount": payment_data["transaction_amount"],
                    "payer_email": payment_data["payer"]["email"],
                    "external_reference": payment_data.get("external_reference"),
                    "payment_method": payment_data["payment_method_id"],
                    "created_at": payment_data["date_created"],
                    "approved_at": payment_data.get("date_approved")
                }

        except Exception as e:
            logger.error(f"Error checking payment status: {e}")
            raise

    def parse_webhook_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse a webhook notification from Mercado Pago.

        Args:
            notification_data: Webhook payload

        Returns:
            Parsed notification data
        """
        return {
            "type": notification_data.get("type"),
            "payment_id": notification_data.get("data", {}).get("id"),
            "action": notification_data.get("action"),
            "user_id": notification_data.get("user_id")
        }

    def format_payment_info_message(self, payment_data: Dict[str, Any], plan: SubscriptionPlan) -> str:
        """
        Format payment information for user display.

        Args:
            payment_data: Payment data from API
            plan: Subscription plan

        Returns:
            Formatted message in Portuguese
        """
        plan_details = PLAN_PRICING[plan]

        if "qr_code" in payment_data:
            # PIX payment
            message = f"""💰 **Pagamento PIX Gerado**

📦 Plano: {plan_details['name']}
💵 Valor: R$ {plan_details['price']:.2f}

🔍 **Como Pagar:**
1. Abra o app do seu banco
2. Escolha "Pagar com PIX"
3. Escaneie o QR Code ou cole o código

⏰ O PIX expira em 30 minutos
✅ Após o pagamento, seu acesso será liberado automaticamente

PIX Copia e Cola:
`{payment_data['qr_code']}`
"""
        else:
            # Credit card or checkout link
            message = f"""💰 **Checkout de Pagamento**

📦 Plano: {plan_details['name']}
💵 Valor: R$ {plan_details['price']:.2f}

Acesse o link para completar o pagamento:
{payment_data.get('init_point', 'Link não disponível')}

✅ Após a confirmação, seu acesso será liberado automaticamente
"""

        return message


# Global payment processor instance
payment_processor = PaymentProcessor()
