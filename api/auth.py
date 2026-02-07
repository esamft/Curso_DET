"""
DET Flow - Authentication Endpoints
Handles user registration, login, and token management.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from typing import Optional
import logging
from datetime import datetime

from core.database import get_db
from core.models import User
from core.auth import auth_manager, get_password_hash, verify_password, create_access_token
from core.subscription import subscription_manager, SubscriptionStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()


# ==================== Pydantic Models ====================

class RegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=2)
    phone_number: str
    cpf: Optional[str] = None


class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response with token."""
    access_token: str
    token_type: str = "bearer"
    user: dict


class PasswordResetRequest(BaseModel):
    """Password reset request."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8)


# ==================== Dependency Functions ====================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer token
        db: Database session

    Returns:
        User object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    payload = auth_manager.decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify they have active subscription.

    Args:
        current_user: Current authenticated user

    Returns:
        User object if subscription is active

    Raises:
        HTTPException: If subscription is expired
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Check subscription
    has_access = subscription_manager.has_active_subscription(
        current_user.subscription_end_date,
        current_user.subscription_status
    )

    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Assinatura expirada. Por favor, renove para continuar."
        )

    return current_user


# ==================== Endpoints ====================

@router.post("/register", response_model=LoginResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Creates a new user with trial subscription (3 days free).
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == request.email) | (User.phone_number == request.phone_number)
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email ou telefone já cadastrado"
            )

        # Hash password
        password_hash = get_password_hash(request.password)

        # Grant trial period
        trial_end = subscription_manager.grant_trial(trial_days=3)

        # Create user
        new_user = User(
            email=request.email,
            password_hash=password_hash,
            full_name=request.full_name,
            name=request.full_name.split()[0],  # First name
            phone_number=request.phone_number,
            cpf=request.cpf,
            subscription_status=SubscriptionStatus.TRIAL,
            subscription_end_date=trial_end,
            created_at=datetime.now(),
            last_active=datetime.now(),
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate access token
        access_token = create_access_token({
            "user_id": new_user.id,
            "email": new_user.email
        })

        logger.info(f"New user registered: {new_user.email}")

        return LoginResponse(
            access_token=access_token,
            user={
                "id": new_user.id,
                "email": new_user.email,
                "full_name": new_user.full_name,
                "subscription_status": new_user.subscription_status,
                "trial_ends": trial_end.isoformat() if trial_end else None
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar conta"
        )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return access token.
    """
    try:
        # Find user
        user = db.query(User).filter(User.email == request.email).first()

        if not user or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )

        # Verify password
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )

        # Check if account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Conta desativada. Entre em contato com o suporte."
            )

        # Update last active
        user.last_active = datetime.now()
        db.commit()

        # Generate access token
        access_token = create_access_token({
            "user_id": user.id,
            "email": user.email
        })

        logger.info(f"User logged in: {user.email}")

        return LoginResponse(
            access_token=access_token,
            user={
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "subscription_status": user.subscription_status,
                "subscription_end_date": user.subscription_end_date.isoformat() if user.subscription_end_date else None
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao fazer login"
        )


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information and subscription status.
    """
    days_remaining = subscription_manager.days_remaining(current_user.subscription_end_date)

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
        "subscription": {
            "status": current_user.subscription_status,
            "plan": current_user.subscription_plan,
            "end_date": current_user.subscription_end_date.isoformat() if current_user.subscription_end_date else None,
            "days_remaining": days_remaining,
            "message": subscription_manager.format_subscription_message(
                current_user.subscription_status,
                current_user.subscription_end_date,
                current_user.subscription_plan
            )
        },
        "stats": {
            "total_submissions": current_user.total_submissions,
            "current_level": current_user.current_level,
            "target_score": current_user.target_score
        },
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


@router.post("/password-reset/request")
async def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Request a password reset token.
    """
    user = db.query(User).filter(User.email == request.email).first()

    # Always return success (don't reveal if email exists)
    if user:
        reset_token = auth_manager.generate_password_reset_token(user.email)

        # In production, send this via email
        # For now, just log it
        logger.info(f"Password reset requested for {user.email}")
        logger.info(f"Reset token: {reset_token}")

        # Store token in database (add expiration)
        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.now() + timedelta(hours=1)
        db.commit()

    return {"message": "Se o email existir, você receberá instruções para redefinir sua senha."}


@router.post("/password-reset/confirm")
async def confirm_password_reset(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """
    Confirm password reset with token.
    """
    email = auth_manager.verify_password_reset_token(request.token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    # Update password
    user.password_hash = get_password_hash(request.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    db.commit()

    logger.info(f"Password reset completed for {user.email}")

    return {"message": "Senha redefinida com sucesso!"}
