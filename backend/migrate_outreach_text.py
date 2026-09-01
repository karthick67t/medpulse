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
    "ALTER TABLE outreach_logs MODIFY COLUMN response TEXT NULL;"
]

for q in alter_queries:
    try:
        cursor.execute(q)
        print("Success:", q)
    except Exception as e:
        print("Note:", e)

conn.commit()
conn.close()
print("Outreach column text migration finished!")
