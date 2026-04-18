from fastapi import HTTPException, status
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os

def create_token(email):
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(
            minutes=int(os.getenv("JWT_EXPIRE_MIN"))
        )
    }
    return jwt.encode(payload, os.getenv("JWT_SECRET"),
                      algorithm=os.getenv("JWT_ALGORITHM"))




def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),
            algorithms=[os.getenv("JWT_ALGORITHM")]
        )
        email = payload.get("sub")

        if email is None:
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
