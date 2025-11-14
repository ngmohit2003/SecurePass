from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3
from passmanager_phase1 import derive_key, encrypt, decrypt
from passmanager_phase2 import init_db

app = Flask(__name__)
app.secret_key = "supersecretkey"  # for flash messages

DB_PATH = "passmanager.db"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/add", methods=["POST"])
def add():
    website = request.form["website"]
    username = request.form["username"]
    password = request.form["password"]
    master = request.form["master"]

    conn = init_db(DB_PATH)
    c = conn.cursor()

    # get salt and derive key
    salt = c.execute("SELECT v FROM settings WHERE k='salt'").fetchone()[0]
    iters = int(c.execute("SELECT v FROM settings WHERE k='pbkdf2_iters'").fetchone()[0].decode())
    key = derive_key(master, salt, iters)

    ciphertext, nonce, tag = encrypt(password.encode(), key)

    c.execute("""INSERT INTO passwords (website, username, password_encrypted, nonce, tag, created_at)
                 VALUES (?,?,?,?,?,datetime('now'))""",
              (website, username, ciphertext, nonce, tag))
    conn.commit()
    conn.close()

    flash("Password stored securely!", "success")
    return redirect(url_for("index"))

@app.route("/list")
def list_passwords():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    rows = c.execute("SELECT id, website, username, created_at FROM passwords").fetchall()
    conn.close()
    return render_template("list.html", rows=rows)

@app.route("/get/<int:pid>", methods=["POST"])
def get_password(pid):
    master = request.form["master"]
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    salt = c.execute("SELECT v FROM settings WHERE k='salt'").fetchone()[0]
    iters = int(c.execute("SELECT v FROM settings WHERE k='pbkdf2_iters'").fetchone()[0].decode())
    key = derive_key(master, salt, iters)

    row = c.execute("SELECT password_encrypted, nonce, tag FROM passwords WHERE id=?", (pid,)).fetchone()
    conn.close()

    try:
        pt = decrypt(row[0], row[1], row[2], key).decode()
        flash(f"Password: {pt}", "info")
    except Exception:
        flash("Incorrect master password!", "danger")

    return redirect(url_for("list_passwords"))

if __name__ == "__main__":
    app.run(debug=True)
