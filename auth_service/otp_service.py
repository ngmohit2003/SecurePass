import random
from passlib.context import CryptContext
from datetime import datetime, timedelta


pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


def generate_otp():
    return str(random.randint(100000, 999999))

def hash_otp(otp):
    return pwd_context.hash(otp)

def verify_otp(plain, hashed):
    return pwd_context.verify(plain, hashed)

def otp_expiry():
    return datetime.utcnow() + timedelta(minutes=5)
