from jose import jwt, JWTError
from datetime import datetime
from fastapi import HTTPException, status
from dotenv import load_dotenv
from pathlib import Path
import os


# 🔥 Load shared JWT config explicitly
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / "shared" / "jwt_config.env")

def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),
            algorithms=[os.getenv("JWT_ALGORITHM")]
        )

        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        return email

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

