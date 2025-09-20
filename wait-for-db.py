import os
import time
import psycopg2
from psycopg2 import OperationalError

DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", 5432)
DB_NAME = os.getenv("POSTGRES_DB", "monitor_db")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")

MAX_RETRIES = 10

for i in range(MAX_RETRIES):
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.close()
        print("✅ Database is ready!")
        break
    except OperationalError as e:
        print(f"⏳ DB not ready ({i+1}/{MAX_RETRIES})... retrying in 2s")
        time.sleep(2)
else:
    print("❌ DB not ready after retries, exiting.")
    exit(1)
