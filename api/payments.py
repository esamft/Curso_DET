"""
DET Flow - Payment Endpoints
Handles payment processing, PIX generation, and webhooks.
"""

from fastapi import APIRouter, HTTPException, Depends, Request, status, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import logging
from datetime import datetime

from core.database import get_db
from core.models import User
from core.payments import payment_processor, MercadoPagoError
from core.subscription import SubscriptionPlan, PLAN_PRICING, subscription_manager
from api.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["Payments"])


# ==================== Pydantic Models ====================

class CreatePaymentRequest(BaseModel):
    """Request to create a payment."""
    plan: SubscriptionPlan
    payment_method: str = "pix"  # pix or credit_card


class CreatePaymentResponse(BaseModel):
    """Payment creation response."""
    payment_id: str
    status: str
    plan: str
    amount: float
    payment_data: dict
    message: str


# ==================== Helper Functions ====================

async def save_payment_to_db(
    db: Session,
    user_id: int,
    payment_data: dict,
    plan: SubscriptionPlan
) -> int:
    """
    Save payment information to database.

    Args:
        db: Database session
        user_id: User ID
        payment_data: Payment data from provider
        plan: Subscription plan

    Returns:
        Payment database ID
    """
    from core.models import Submission  # Avoid circular import

    # We need to add a Payment model to core/models.py
    # For now, let's just log it
    logger.info(f"Payment created for user {user_id}: {payment_data.get('payment_id')}")

    # TODO: Insert into payments table
    # payment = Payment(...)
    # db.add(payment)
    # db.commit()

    return 0  # Return payment DB ID


async def process_payment_webhook_background(
    db: Session,
    payment_id: str,
    notification_type: str
):
    """
    Process payment webhook in the background.

    Args:
        db: Database session
        payment_id: Payment ID from provider
        notification_type: Type of notification
    """
    try:
        # Check payment status
        payment_status = await payment_processor.check_payment_status(payment_id)

        logger.info(f"Webhook processing: {payment_id} - Status: {payment_status['status']}")

        if payment_status['status'] == 'approved':
            # Extract user_id from external_reference
            external_ref = payment_status.get('external_reference', '')
            if 'user_' in external_ref:
                user_id = int(external_ref.split('user_')[1].split('_')[0])
                plan = external_ref.split('plan_')[1]

                # Update user subscription
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    # Calculate new end date
                    end_date = subscription_manager.calculate_subscription_end_date(
                        SubscriptionPlan(plan)
                    )

                    user.subscription_status = "active"
                    user.subscription_plan = plan
                    user.subscription_start_date = datetime.now()
                    user.subscription_end_date = end_date
                    user.subscription_tier = "premium"

                    db.commit()

                    logger.info(f"Subscription activated for user {user_id}")

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")


# ==================== Endpoints ====================

@router.get("/plans")
async def get_available_plans():
    """
    Get all available subscription plans with pricing.
    """
    plans = subscription_manager.get_all_plans()

    return {
        "plans": [
            {
                "id": plan_id,
                "name": details["name"],
                "description": details["description"],
                "price": details["price"],
                "duration_days": details["duration_days"],
                "price_per_day": round(details["price"] / details["duration_days"], 2)
            }
            for plan_id, details in plans.items()
        ]
    }


@router.post("/create", response_model=CreatePaymentResponse)
async def create_payment(
    request: CreatePaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new payment for subscription.

    Supports PIX and credit card payments via Mercado Pago.
    """
    try:
        plan_details = PLAN_PRICING[request.plan]

        if request.payment_method == "pix":
            # Create PIX payment
            payment_data = await payment_processor.create_pix_payment(
                user_id=current_user.id,
                user_email=current_user.email,
                plan=request.plan,
                user_name=current_user.full_name,
                user_cpf=current_user.cpf
            )

            # Format message
            message = payment_processor.format_payment_info_message(payment_data, request.plan)

        else:
            # Create payment preference (checkout link)
            payment_data = await payment_processor.create_payment_preference(
                user_id=current_user.id,
                user_email=current_user.email,
                plan=request.plan,
                user_phone=current_user.phone_number
            )

            message = f"Acesse o link para completar o pagamento:\n{payment_data.get('init_point')}"

        # Save payment to database
        await save_payment_to_db(db, current_user.id, payment_data, request.plan)

        return CreatePaymentResponse(
            payment_id=payment_data.get('payment_id') or payment_data.get('id'),
            status="pending",
            plan=request.plan,
            amount=plan_details["price"],
            payment_data=payment_data,
            message=message
        )

    except MercadoPagoError as e:
        logger.error(f"Mercado Pago error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar pagamento: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Payment creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar pagamento"
        )


@router.post("/webhook")
async def mercado_pago_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint for Mercado Pago payment notifications.

    This is called by Mercado Pago when payment status changes.
    """
    try:
        # Get webhook payload
        payload = await request.json()
        logger.info(f"Webhook received: {payload}")

        # Parse notification
        notification = payment_processor.parse_webhook_notification(payload)

        if notification['type'] == 'payment' and notification['payment_id']:
            # Process in background to avoid timeout
            background_tasks.add_task(
                process_payment_webhook_background,
                db,
                notification['payment_id'],
                notification['type']
            )

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        # Return 200 to avoid retries
        return {"status": "error", "message": str(e)}


@router.get("/status/{payment_id}")
async def check_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check the status of a payment.
    """
    try:
        status_info = await payment_processor.check_payment_status(payment_id)

        return {
            "payment_id": status_info['payment_id'],
            "status": status_info['status'],
            "status_detail": status_info['status_detail'],
            "amount": status_info['amount'],
            "payment_method": status_info['payment_method'],
            "approved_at": status_info.get('approved_at')
        }

    except MercadoPagoError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pagamento não encontrado: {str(e)}"
        )


@router.get("/history")
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get payment history for current user.
    """
    # TODO: Query from payments table
    # payments = db.query(Payment).filter(Payment.user_id == current_user.id).all()

    return {
        "user_id": current_user.id,
        "payments": [
            # Map payment records here
        ]
    }


@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel user's subscription.

    Access remains active until the end of the paid period.
    """
    try:
        if current_user.subscription_status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não há assinatura ativa para cancelar"
            )

        # Update subscription status
        current_user.subscription_status = "cancelled"
        current_user.auto_renew = False

        db.commit()

        days_remaining = subscription_manager.days_remaining(current_user.subscription_end_date)

        logger.info(f"Subscription cancelled for user {current_user.id}")

        return {
            "message": "Assinatura cancelada com sucesso",
            "access_until": current_user.subscription_end_date.isoformat() if current_user.subscription_end_date else None,
            "days_remaining": days_remaining
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancellation error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cancelar assinatura"
        )
