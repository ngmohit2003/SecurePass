import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import constant_time
import secrets
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _get_key() -> bytes:
    key = os.getenv("PASSWORD_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("PASSWORD_ENCRYPTION_KEY not set")

    key_bytes = key.encode()

    if len(key_bytes) != 32:
        raise RuntimeError("Encryption key must be exactly 32 bytes")

    return key_bytes


def encrypt_password(plain_password: str) -> tuple[bytes, bytes]:
    """
    Encrypts plaintext password using AES-256-GCM.

    Returns:
        encrypted_password (bytes)
        iv (bytes)
    """
    key = _get_key()
    aesgcm = AESGCM(key)

    iv = secrets.token_bytes(12)  # 96-bit nonce (recommended for GCM)
    encrypted = aesgcm.encrypt(
        iv,
        plain_password.encode(),
        None
    )

    return encrypted, iv


def decrypt_password(encrypted_password: bytes, iv: bytes) -> str:
    """
    Decrypts AES-256-GCM encrypted password.
    """
    key = _get_key()
    aesgcm = AESGCM(key)

    decrypted = aesgcm.decrypt(
        iv,
        encrypted_password,
        None
    )

    return decrypted.decode()
