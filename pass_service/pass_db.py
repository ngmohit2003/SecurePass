import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db():
    """
    Returns a new database connection.
    Caller is responsible for closing it.
    """
    try:
        conn = psycopg2.connect(
            DATABASE_URL,
            sslmode="require"
        )
        print("✅ Connected to Supabase PostgreSQL")
        return conn
    except Exception as e:
        print("❌ Failed to connect to Supabase:", e)
        raise