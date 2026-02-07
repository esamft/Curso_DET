"""
DET Flow - Admin Dashboard API
Administrative endpoints for managing users, payments, and platform.
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional, List
import logging
from datetime import datetime, timedelta

from core.database import get_db
from core.models import User, Submission
from core.auth import get_password_hash
from core.subscription import SubscriptionStatus, SubscriptionPlan, subscription_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ==================== Admin Authentication ====================

# For now, we'll use a simple API key
# In production, implement proper admin JWT authentication

ADMIN_API_KEY = "admin_secret_key_change_me"  # Move to .env


def verify_admin_key(api_key: str = Query(..., alias="admin_key")):
    """Verify admin API key."""
    if api_key != ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin credentials"
        )
    return True


# ==================== Pydantic Models ====================

class UpdateUserRequest(BaseModel):
    """Request to update user information."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    subscription_status: Optional[SubscriptionStatus] = None
    subscription_plan: Optional[SubscriptionPlan] = None
    subscription_end_date: Optional[datetime] = None
    target_score: Optional[int] = None
    current_level: Optional[str] = None
    is_active: Optional[bool] = None


class GrantAccessRequest(BaseModel):
    """Request to grant subscription access."""
    plan: SubscriptionPlan
    duration_days: Optional[int] = None


# ==================== Dashboard Statistics ====================

@router.get("/stats")
async def get_dashboard_stats(
    admin: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard statistics.

    Returns metrics on users, subscriptions, revenue, and activity.
    """
    try:
        # User statistics
        total_users = db.query(func.count(User.id)).scalar()
        active_subscribers = db.query(func.count(User.id)).filter(
            and_(
                User.subscription_status == SubscriptionStatus.ACTIVE,
                User.subscription_end_date > datetime.now()
            )
        ).scalar()

        trial_users = db.query(func.count(User.id)).filter(
            User.subscription_status == SubscriptionStatus.TRIAL
        ).scalar()

        expired_users = db.query(func.count(User.id)).filter(
            User.subscription_status == SubscriptionStatus.EXPIRED
        ).scalar()

        # New users today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        new_users_today = db.query(func.count(User.id)).filter(
            User.created_at >= today_start
        ).scalar()

        # New users this week
        week_start = datetime.now() - timedelta(days=7)
        new_users_week = db.query(func.count(User.id)).filter(
            User.created_at >= week_start
        ).scalar()

        # Submission statistics
        total_submissions = db.query(func.count(Submission.id)).scalar()
        submissions_today = db.query(func.count(Submission.id)).filter(
            Submission.created_at >= today_start
        ).scalar()

        # Average score
        avg_score = db.query(func.avg(Submission.overall_score)).filter(
            Submission.overall_score.isnot(None)
        ).scalar()

        # Subscriptions expiring soon (next 7 days)
        expiring_soon = db.query(func.count(User.id)).filter(
            and_(
                User.subscription_status == SubscriptionStatus.ACTIVE,
                User.subscription_end_date <= datetime.now() + timedelta(days=7),
                User.subscription_end_date > datetime.now()
            )
        ).scalar()

        return {
            "users": {
                "total": total_users,
                "active_subscribers": active_subscribers,
                "trial_users": trial_users,
                "expired": expired_users,
                "new_today": new_users_today,
                "new_this_week": new_users_week,
                "expiring_soon": expiring_soon
            },
            "submissions": {
                "total": total_submissions,
                "today": submissions_today,
                "average_score": round(float(avg_score), 2) if avg_score else 0
            },
            "revenue": {
                "mrr": active_subscribers * 29.90,  # Simplified MRR calculation
                "note": "Conecte com sistema de pagamentos para dados precisos"
            },
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error fetching admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar estatísticas: {str(e)}"
        )


# ==================== User Management ====================

@router.get("/users")
async def list_users(
    admin: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    subscription_status: Optional[str] = None,
    search: Optional[str] = None
):
    """
    List all users with filtering and pagination.
    """
    try:
        query = db.query(User)

        # Filter by subscription status
        if subscription_status:
            query = query.filter(User.subscription_status == subscription_status)

        # Search by name, email, or phone
        if search:
            query = query.filter(
                (User.full_name.ilike(f"%{search}%")) |
                (User.email.ilike(f"%{search}%")) |
                (User.phone_number.ilike(f"%{search}%"))
            )

        # Get total count
        total = query.count()

        # Apply pagination
        users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "phone_number": user.phone_number,
                    "subscription_status": user.subscription_status,
                    "subscription_plan": user.subscription_plan,
                    "subscription_end_date": user.subscription_end_date.isoformat() if user.subscription_end_date else None,
                    "days_remaining": subscription_manager.days_remaining(user.subscription_end_date),
                    "total_submissions": user.total_submissions,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "last_active": user.last_active.isoformat() if user.last_active else None,
                    "is_active": user.is_active
                }
                for user in users
            ]
        }

    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao listar usuários"
        )


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: int,
    admin: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific user.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    # Get recent submissions
    recent_submissions = db.query(Submission).filter(
        Submission.user_id == user_id
    ).order_by(Submission.created_at.desc()).limit(10).all()

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "cpf": user.cpf,
            "subscription_status": user.subscription_status,
            "subscription_plan": user.subscription_plan,
            "subscription_start_date": user.subscription_start_date.isoformat() if user.subscription_start_date else None,
            "subscription_end_date": user.subscription_end_date.isoformat() if user.subscription_end_date else None,
            "total_submissions": user.total_submissions,
            "current_level": user.current_level,
            "target_score": user.target_score,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_active": user.last_active.isoformat() if user.last_active else None,
            "is_active": user.is_active
        },
        "recent_submissions": [
            {
                "id": s.id,
                "task_type": s.task_type,
                "overall_score": s.overall_score,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "status": s.status
            }
            for s in recent_submissions
        ]
    }


@router.patch("/users/{user_id}")
async def update_user(
    user_id: int,
    updates: UpdateUserRequest,
    admin: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db)
):
    """
    Update user information.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    # Apply updates
    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    logger.info(f"User {user_id} updated by admin")

    return {"message": "Usuário atualizado com sucesso", "user_id": user_id}


@router.post("/users/{user_id}/grant-access")
async def grant_user_access(
    user_id: int,
    request: GrantAccessRequest,
    admin: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db)
):
    """
    Grant subscription access to a user (manual/complimentary).
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    # Calculate end date
    end_date = subscription_manager.calculate_subscription_end_date(request.plan)

    # If custom duration specified
    if request.duration_days:
        end_date = datetime.now() + timedelta(days=request.duration_days)

    # Update user subscription
    user.subscription_status = SubscriptionStatus.ACTIVE
    user.subscription_plan = request.plan
    user.subscription_start_date = datetime.now()
    user.subscription_end_date = end_date
    user.subscription_tier = "premium"

    db.commit()

    logger.info(f"Access granted to user {user_id} by admin - Plan: {request.plan}")

    return {
        "message": "Acesso concedido com sucesso",
        "user_id": user_id,
        "plan": request.plan,
        "end_date": end_date.isoformat(),
        "days_granted": request.duration_days or subscription_manager.get_plan_details(request.plan)["duration_days"]
    }


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    admin: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db)
):
    """
    Deactivate a user account.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    user.is_active = False
    user.subscription_status = SubscriptionStatus.CANCELLED

    db.commit()

    logger.warning(f"User {user_id} deactivated by admin")

    return {"message": "Usuário desativado", "user_id": user_id}


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    admin: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db)
):
    """
    Reactivate a user account.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    user.is_active = True

    db.commit()

    logger.info(f"User {user_id} reactivated by admin")

    return {"message": "Usuário reativado", "user_id": user_id}


# ==================== System Management ====================

@router.post("/system/expire-subscriptions")
async def expire_old_subscriptions(
    admin: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db)
):
    """
    Manually trigger expiration of old subscriptions.

    This should normally run as a scheduled task.
    """
    try:
        # Find expired subscriptions
        expired_users = db.query(User).filter(
            and_(
                User.subscription_status == SubscriptionStatus.ACTIVE,
                User.subscription_end_date < datetime.now()
            )
        ).all()

        count = 0
        for user in expired_users:
            user.subscription_status = SubscriptionStatus.EXPIRED
            count += 1

        db.commit()

        logger.info(f"Expired {count} subscriptions")

        return {
            "message": f"{count} assinaturas expiradas",
            "expired_count": count
        }

    except Exception as e:
        logger.error(f"Error expiring subscriptions: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao expirar assinaturas"
        )
