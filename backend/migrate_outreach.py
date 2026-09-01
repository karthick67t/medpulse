import pymysql

conn = pymysql.connect(
    host='localhost',
    port=3306,
    user='root',
    password='Karthick@15',
    database='caretrack'
)

cursor = conn.cursor()

alter_queries = [
    "ALTER TABLE patients ADD COLUMN preferred_contact_method VARCHAR(50) DEFAULT 'Phone';",
    "ALTER TABLE patients ADD COLUMN whatsapp_number VARCHAR(50) NULL;",
    "ALTER TABLE patients ADD COLUMN last_contacted_at DATETIME NULL;",
    "ALTER TABLE patients ADD COLUMN contact_attempt_count INT DEFAULT 0;",
    "ALTER TABLE patients ADD COLUMN appointment_confirmed BOOLEAN DEFAULT FALSE;"
]

for q in alter_queries:
    try:
        cursor.execute(q)
        print("Success:", q)
    except Exception as e:
        print("Note:", e)

conn.commit()
conn.close()
print("Migration finished!")
