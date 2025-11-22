import psycopg2
import pandas as pd
from psycopg2.extras import execute_batch

# === 1. Read CSV ===
df = pd.read_csv(r"C:\Users\vedan\OneDrive\Desktop\MediGuard\MediGuardAI-AgniOps\frontend\mediguard-web\src\model_output\Blood_samples_dataset_extended_scaled_11300.csv")

# === 2. Connect to Neon PostgreSQL ===
DATABASE_URL = "postgresql://neondb_owner:npg_cnPiGrNvK3Q0@ep-falling-term-a1ix3b9f-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

columns = list(df.columns)
columns_sql = ", ".join(f'"{col}"' for col in columns)
placeholders = ", ".join(["%s"] * len(columns))

insert_query = f"""
    INSERT INTO blood_samples ({columns_sql})
    VALUES ({placeholders})
"""

# Convert DataFrame rows to list of tuples
data = [tuple(row) for _, row in df.iterrows()]

# Batch insert (1000 rows at a time)
execute_batch(cur, insert_query, data, page_size=1000)

conn.commit()
cur.close()
conn.close()

print("Upload complete!")