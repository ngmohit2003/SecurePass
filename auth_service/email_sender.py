import smtplib
from email.message import EmailMessage
import os

def send_otp_email(receiver, otp):
    msg = EmailMessage()
    msg["Subject"] = "Your ToolKit Login OTP"
    msg["From"] = os.getenv("EMAIL_ADDRESS")
    msg["To"] = receiver
    msg.set_content(f"Your OTP is: {otp}\nValid for 5 minutes.")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(
            os.getenv("EMAIL_ADDRESS"),
            os.getenv("EMAIL_APP_PASSWORD")
        )
        server.send_message(msg)
