"""
DET Flow - Authentication System
JWT-based authentication with password hashing and token management.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging
from passlib.context import CryptContext
from jose import JWTError, jwt

from core.config import settings

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


class AuthManager:
    """Manages authentication, password hashing, and JWT tokens."""

    def __init__(self):
        """Initialize the authentication manager."""
        self.secret_key = settings.secret_key
        self.algorithm = ALGORITHM

    def hash_password(self, password: str) -> str:
        """
        Hash a password using bcrypt.

        Args:
            password: Plain text password

        Returns:
            Hashed password
        """
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash.

        Args:
            plain_password: Plain text password
            hashed_password: Hashed password from database

        Returns:
            True if password matches, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)

    def create_access_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token.

        Args:
            data: Data to encode in the token (usually user_id, email)
            expires_delta: Optional custom expiration time

        Returns:
            Encoded JWT token
        """
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow()
        })

        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def decode_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Decode and verify a JWT token.

        Args:
            token: JWT token string

        Returns:
            Decoded token payload or None if invalid
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            logger.error(f"JWT decode error: {e}")
            return None

    def generate_password_reset_token(self, email: str) -> str:
        """
        Generate a password reset token.

        Args:
            email: User's email

        Returns:
            Reset token
        """
        delta = timedelta(hours=1)  # Reset token expires in 1 hour
        data = {"sub": email, "type": "password_reset"}
        return self.create_access_token(data, expires_delta=delta)

    def verify_password_reset_token(self, token: str) -> Optional[str]:
        """
        Verify a password reset token and extract email.

        Args:
            token: Reset token

        Returns:
            Email if token is valid, None otherwise
        """
        payload = self.decode_access_token(token)
        if payload and payload.get("type") == "password_reset":
            return payload.get("sub")
        return None


# Global auth manager instance
auth_manager = AuthManager()


def get_password_hash(password: str) -> str:
    """Convenience function to hash passwords."""
    return auth_manager.hash_password(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Convenience function to verify passwords."""
    return auth_manager.verify_password(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any]) -> str:
    """Convenience function to create access tokens."""
    return auth_manager.create_access_token(data)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Convenience function to decode tokens."""
    return auth_manager.decode_access_token(token)
