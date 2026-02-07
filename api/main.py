"""
DET Flow - FastAPI Main Application
Provides REST API endpoints for WhatsApp webhook integration and dashboard access.
"""

from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging
from datetime import datetime

from core.config import settings
from core.database import init_db, close_db, get_db, SessionLocal
from core.models import User, Submission
from maestro import maestro
from sqlalchemy.orm import Session

# Configure logging
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="DET Flow API",
    description="Duolingo English Test Preparation Platform with AI Agents",
    version="1.0.0",
    debug=settings.app_debug
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Pydantic Models ====================

class WhatsAppMessage(BaseModel):
    """Incoming WhatsApp message from Evolution API."""
    phone: str = Field(..., description="Sender's phone number")
    message: str = Field(..., description="Message text")
    instance: Optional[str] = Field(None, description="Evolution API instance name")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")


class WhatsAppResponse(BaseModel):
    """Response to be sent back via WhatsApp."""
    phone: str
    message: str
    success: bool
    metadata: Optional[Dict[str, Any]] = None


class SubmissionRequest(BaseModel):
    """Direct submission request (alternative to WhatsApp)."""
    user_id: int
    task_type: str
    task_prompt: str
    response_text: str


class SubmissionResponse(BaseModel):
    """Submission evaluation response."""
    submission_id: int
    overall_score: int
    subscores: Dict[str, int]
    feedback: str
    cefr_level: str


# ==================== Startup/Shutdown Events ====================

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup."""
    try:
        logger.info("Initializing DET Flow API...")
        init_db()
        logger.info("DET Flow API started successfully")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    try:
        logger.info("Shutting down DET Flow API...")
        close_db()
        logger.info("DET Flow API shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# ==================== Authentication ====================

def verify_evolution_api_key(api_key: Optional[str] = Header(None, alias="X-API-Key")):
    """Verify Evolution API key for webhook security."""
    if settings.app_env == "production":
        if not api_key or api_key != settings.evolution_api_key:
            raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key


# ==================== API Endpoints ====================

@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "name": "DET Flow API",
        "version": "1.0.0",
        "status": "operational",
        "environment": settings.app_env,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/webhook/whatsapp", response_model=WhatsAppResponse)
async def whatsapp_webhook(
    message: WhatsAppMessage,
    api_key: str = Depends(verify_evolution_api_key)
):
    """
    Webhook endpoint for receiving WhatsApp messages from Evolution API.

    This endpoint receives messages from Evolution API and processes them through the Maestro.
    """
    try:
        logger.info(f"Received WhatsApp message from {message.phone}")

        # Process message through Maestro
        result = maestro.process_user_message(
            phone_number=message.phone,
            message=message.message,
            session_id=message.session_id
        )

        # Prepare response
        response = WhatsAppResponse(
            phone=message.phone,
            message=result.get("response", "Erro ao processar mensagem"),
            success=True,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "session_id": message.session_id
            }
        )

        logger.info(f"WhatsApp message processed successfully for {message.phone}")
        return response

    except Exception as e:
        logger.error(f"Error processing WhatsApp webhook: {e}")
        return WhatsAppResponse(
            phone=message.phone,
            message="Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
            success=False,
            metadata={"error": str(e)}
        )


@app.post("/api/submissions", response_model=SubmissionResponse)
async def create_submission(
    submission: SubmissionRequest,
    db: Session = Depends(get_db)
):
    """
    Direct API endpoint for creating and evaluating submissions.

    Alternative to WhatsApp webhook for web dashboard or mobile app integration.
    """
    try:
        # Get user
        user = db.query(User).filter(User.id == submission.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Create submission record
        db_submission = Submission(
            user_id=user.id,
            task_type=submission.task_type,
            task_prompt=submission.task_prompt,
            response_text=submission.response_text,
            status="evaluating",
            created_at=datetime.now()
        )
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)

        # Evaluate using Maestro's evaluator
        evaluation = maestro.evaluator.evaluate_submission(
            task_type=submission.task_type,
            task_prompt=submission.task_prompt,
            response_text=submission.response_text,
            user_level=user.current_level
        )

        # Update submission with results
        db_submission.overall_score = evaluation.get("overall_score")
        db_submission.literacy_score = evaluation.get("subscores", {}).get("literacy")
        db_submission.comprehension_score = evaluation.get("subscores", {}).get("comprehension")
        db_submission.conversation_score = evaluation.get("subscores", {}).get("conversation")
        db_submission.production_score = evaluation.get("subscores", {}).get("production")
        db_submission.feedback = evaluation
        db_submission.evaluator_comments = evaluation.get("feedback")
        db_submission.evaluated_at = datetime.now()
        db_submission.status = "completed"

        user.total_submissions += 1

        db.commit()

        # Return response
        return SubmissionResponse(
            submission_id=db_submission.id,
            overall_score=evaluation.get("overall_score"),
            subscores=evaluation.get("subscores"),
            feedback=evaluation.get("feedback"),
            cefr_level=evaluation.get("cefr_level")
        )

    except Exception as e:
        logger.error(f"Error creating submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/users/{phone_number}")
async def get_user(phone_number: str, db: Session = Depends(get_db)):
    """Get user information by phone number."""
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "phone_number": user.phone_number,
        "name": user.name,
        "current_level": user.current_level,
        "target_score": user.target_score,
        "total_submissions": user.total_submissions,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "subscription_tier": user.subscription_tier
    }


@app.get("/api/users/{user_id}/submissions")
async def get_user_submissions(
    user_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get user's submission history."""
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == user_id)
        .order_by(Submission.created_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "user_id": user_id,
        "total": len(submissions),
        "submissions": [
            {
                "id": s.id,
                "task_type": s.task_type,
                "overall_score": s.overall_score,
                "cefr_level": s.feedback.get("cefr_level") if s.feedback else None,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "status": s.status
            }
            for s in submissions
        ]
    }


@app.get("/api/submissions/{submission_id}")
async def get_submission(submission_id: int, db: Session = Depends(get_db)):
    """Get detailed submission information."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    return {
        "id": submission.id,
        "user_id": submission.user_id,
        "task_type": submission.task_type,
        "task_prompt": submission.task_prompt,
        "response_text": submission.response_text,
        "overall_score": submission.overall_score,
        "subscores": {
            "literacy": submission.literacy_score,
            "comprehension": submission.comprehension_score,
            "conversation": submission.conversation_score,
            "production": submission.production_score
        },
        "feedback": submission.feedback,
        "evaluator_comments": submission.evaluator_comments,
        "created_at": submission.created_at.isoformat() if submission.created_at else None,
        "evaluated_at": submission.evaluated_at.isoformat() if submission.evaluated_at else None,
        "status": submission.status
    }


# ==================== Error Handlers ====================

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return {
        "error": "Internal server error",
        "detail": str(exc) if settings.app_debug else "An error occurred"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_debug,
        log_level=settings.log_level.lower()
    )
