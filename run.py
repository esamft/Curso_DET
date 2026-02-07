#!/usr/bin/env python3
"""
DET Flow - Startup Script
Convenient script to run the application with proper configuration.
"""

import sys
import logging
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from core.config import settings

logger = logging.getLogger(__name__)


def main():
    """Main entry point for the application."""
    try:
        logger.info("=" * 60)
        logger.info("DET Flow - Starting Application")
        logger.info("=" * 60)
        logger.info(f"Environment: {settings.app_env}")
        logger.info(f"Debug Mode: {settings.app_debug}")
        logger.info(f"Host: {settings.app_host}:{settings.app_port}")
        logger.info("=" * 60)

        # Import uvicorn here to ensure config is loaded first
        import uvicorn

        # Run the application
        uvicorn.run(
            "api.main:app",
            host=settings.app_host,
            port=settings.app_port,
            reload=settings.app_debug,
            log_level=settings.log_level.lower(),
            access_log=True
        )

    except KeyboardInterrupt:
        logger.info("Application stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
