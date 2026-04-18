from fastapi import FastAPI, HTTPException, Body, Depends
from datetime import datetime
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from otp_service import generate_otp, hash_otp, verify_otp, otp_expiry
from email_sender import send_otp_email
from auth_db import get_db
from jwt_utils import create_token
from auth_dependencies import get_current_user

load_dotenv()

app = FastAPI(title="Auth Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://toolkit-5bjf.onrender.com"


    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/send-otp")
def send_otp(email: str=Body(...,embed=False)):
    otp = generate_otp()
    hashed = hash_otp(otp)
    expiry = otp_expiry()

    db = get_db()
    cur = db.cursor()

    try:
        # Debug info (optional)
        cur.execute("SELECT current_database(), current_schema()")
        print("DB INFO:", cur.fetchone())

        # Remove old OTP if exists
        cur.execute(
            "DELETE FROM public.otp_sessions WHERE email=%s",
            (email,)
        )

        # Insert new OTP
        cur.execute(
            """
            INSERT INTO public.otp_sessions (email, otp_hash, expires_at)
            VALUES (%s, %s, %s)
            """,
            (email, hashed, expiry)
        )

        db.commit()
        send_otp_email(email, otp)

        return {"message": "OTP sent successfully"}

    finally:
        cur.close()
        db.close()


@app.post("/verify-otp")
def verify_otp_endpoint(
    email: str=Body(...,embed=False),
    otp: str=Body(...,embed=False)
):
    db = get_db()
    cur = db.cursor()

    try:
        # 1. Fetch OTP
        cur.execute(
            """
            SELECT otp_hash, expires_at
            FROM public.otp_sessions
            WHERE email=%s
            """,
            (email,)
        )
        record = cur.fetchone()

        if not record:
            raise HTTPException(status_code=400, detail="OTP not found or already used")

        otp_hash, expires_at = record

        # 2. Check expiry
        if datetime.utcnow() > expires_at:
            cur.execute(
                "DELETE FROM public.otp_sessions WHERE email=%s",
                (email,)
            )
            db.commit()
            raise HTTPException(status_code=400, detail="OTP expired")

        # 3. Verify OTP
        if not verify_otp(otp, otp_hash):
            raise HTTPException(status_code=400, detail="Invalid OTP")

        # 4. Delete OTP (single use)
        cur.execute(
            "DELETE FROM public.otp_sessions WHERE email=%s",
            (email,)
        )

        # 5. Create user if not exists
        cur.execute(
            "SELECT id FROM users WHERE email=%s",
            (email,)
        )
        user = cur.fetchone()

        if not user:
            cur.execute(
                "INSERT INTO users (email) VALUES (%s)",
                (email,)
            )

        db.commit()

        # 6. Create JWT
        token = create_token(email)

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    finally:
        cur.close()
        db.close()


# 🔐 Protected Route
@app.get("/protected-test")
def protected_test(current_user: str = Depends(get_current_user)):
    return {
        "message": "Access granted",
        "user": current_user
    }