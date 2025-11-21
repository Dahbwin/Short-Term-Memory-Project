import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("log.db")

def init_db(path: Path):
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        level TEXT,
        message TEXT
    )
    """)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db(DB_PATH)
    print(f"Created/initialized database at {DB_PATH.resolve()}")
