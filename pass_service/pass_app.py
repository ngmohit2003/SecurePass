from fastapi import FastAPI, Depends
from auth_dependencies import get_current_user
from models import PasswordCreate, PasswordUpdate
from crypto_utils import encrypt_password, decrypt_password
from pass_db import get_db
from dotenv import load_dotenv
load_dotenv()


app = FastAPI(title="Pass ManagerService")


from fastapi.middleware.cors import CORSMiddleware

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



@app.get("/")
def health():
    return {"status": "Pass_mngr Service Running"}

@app.get("/protected-test")
def protected_test(current_user: str = Depends(get_current_user)):
    return {
        "message": "JWT is valid. Access granted.",
        "user": current_user
    }








@app.post("/passwords")
def create_password(
    data: PasswordCreate,
    user_email: str = Depends(get_current_user)
):
    encrypted, iv = encrypt_password(data.password)

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO password_vault
        (owner_email, service_name, username, password_encrypted, iv)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (user_email, data.service_name, data.username, encrypted, iv)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Password stored securely"}









@app.get("/passwords")
def list_passwords(
    user_email: str = Depends(get_current_user)
):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, service_name, username, password_encrypted, iv
        FROM password_vault
        WHERE owner_email = %s
        """,
        (user_email,)
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    results = []
    for r in rows:
        decrypted = decrypt_password(r[3], r[4])
        results.append({
            "id": r[0],
            "service": r[1],
            "username": r[2],
            "password": decrypted
        })

    return results








@app.put("/passwords/{password_id}")
def update_password(
    password_id: int,
    data: PasswordUpdate,
    user_email: str = Depends(get_current_user)
):
    encrypted, iv = encrypt_password(data.password)

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        UPDATE password_vault
        SET service_name=%s, username=%s,
            password_encrypted=%s, iv=%s,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=%s AND owner_email=%s
        """,
        (data.service_name, data.username, encrypted, iv, password_id, user_email)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Password updated"}









@app.delete("/passwords/{password_id}")
def delete_password(
    password_id: int,
    user_email: str = Depends(get_current_user)
):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        DELETE FROM password_vault
        WHERE id=%s AND owner_email=%s
        """,
        (password_id, user_email)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Password deleted"}
