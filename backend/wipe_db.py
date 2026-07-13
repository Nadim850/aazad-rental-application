import psycopg2
try:
    conn = psycopg2.connect(dbname="azadrental_db", user="postgres", password="@azad5152", host="localhost", port="5432")
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    cur.close()
    conn.close()
    print("Database wiped successfully.")
except Exception as e:
    print(f"Error wiping database: {e}")
