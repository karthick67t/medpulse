import pymysql
from urllib.parse import quote_plus
from sqlalchemy import create_engine, text

MYSQL_USER = "root"
MYSQL_PASSWORD = "Karthick@15"
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
MYSQL_DB = "caretrack"

print("1. Connecting to MySQL server...")
conn = pymysql.connect(
    host=MYSQL_HOST,
    port=MYSQL_PORT,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD
)
cursor = conn.cursor()
cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
print(f"2. Database '{MYSQL_DB}' ensured.")
conn.close()

# Encoded password for SQLAlchemy connection string
encoded_password = quote_plus(MYSQL_PASSWORD)
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{encoded_password}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"

print("3. Testing SQLAlchemy connection...")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
with engine.connect() as connection:
    result = connection.execute(text("SELECT 1 AS test_val"))
    row = result.fetchone()
    print("4. SQLAlchemy SELECT 1 result:", row[0])

print("✅ MySQL Database connection test SUCCESSFUL!")
