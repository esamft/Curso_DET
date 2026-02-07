"""
DET Flow - Core Configuration Module
Manages environment variables and application settings using Pydantic Settings.
"""

from typing import Optional
from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging
from pathlib import Path


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # ==================== API Keys ====================
    openai_api_key: str = Field(..., description="OpenAI API Key")
    openai_model: str = Field(default="gpt-4-turbo-preview", description="Default OpenAI model")
    anthropic_api_key: Optional[str] = Field(default=None, description="Anthropic API Key (optional)")

    # ==================== Database ====================
    database_url: PostgresDsn = Field(..., description="PostgreSQL database URL")
    supabase_url: Optional[str] = Field(default=None, description="Supabase project URL")
    supabase_anon_key: Optional[str] = Field(default=None, description="Supabase anonymous key")
    supabase_service_key: Optional[str] = Field(default=None, description="Supabase service role key")

    # ==================== Evolution API (WhatsApp) ====================
    evolution_api_key: str = Field(..., description="Evolution API authentication key")
    evolution_api_url: str = Field(..., description="Evolution API base URL")
    evolution_instance_name: str = Field(default="det_flow_instance", description="Evolution instance name")

    # ==================== Application Settings ====================
    app_env: str = Field(default="development", description="Application environment")
    app_debug: bool = Field(default=True, description="Debug mode")
    app_host: str = Field(default="0.0.0.0", description="API host")
    app_port: int = Field(default=8000, description="API port")
    secret_key: str = Field(..., description="Application secret key for JWT")

    # ==================== Logging ====================
    log_level: str = Field(default="INFO", description="Logging level")
    log_file: str = Field(default="logs/det_flow.log", description="Log file path")

    # ==================== DET Scoring Configuration ====================
    det_min_score: int = Field(default=10, description="Minimum DET score")
    det_max_score: int = Field(default=160, description="Maximum DET score")
    det_subscores_enabled: bool = Field(default=True, description="Enable subscore calculation")

    # ==================== Session Configuration ====================
    session_timeout_minutes: int = Field(default=30, description="Session timeout in minutes")
    max_submissions_per_day: int = Field(default=10, description="Maximum submissions per user per day")

    # ==================== Redis (Optional) ====================
    redis_url: Optional[str] = Field(default=None, description="Redis connection URL")
    redis_enabled: bool = Field(default=False, description="Enable Redis caching")

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level is a valid logging level."""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        v_upper = v.upper()
        if v_upper not in valid_levels:
            raise ValueError(f"Invalid log level. Must be one of: {valid_levels}")
        return v_upper

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.app_env.lower() == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.app_env.lower() == "development"

    def setup_logging(self) -> None:
        """Configure application logging."""
        log_dir = Path(self.log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)

        logging.basicConfig(
            level=getattr(logging, self.log_level),
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler()
            ]
        )


# Global settings instance
settings = Settings()

# Setup logging on module import
settings.setup_logging()

# Logger for this module
logger = logging.getLogger(__name__)
logger.info(f"DET Flow initialized in {settings.app_env} mode")
