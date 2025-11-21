import sqlite3
from pathlib import Path
import threading
import traceback

DB_NAME = "log.db"
_lock = threading.Lock()


def _db_path(path: Path = None) -> Path:
    if path:
        return Path(path)
    return Path(__file__).with_name(DB_NAME)


def init_db(path: Path = None):
    """Create the log database and table if it doesn't exist."""
    db = _db_path(path)
    try:
        with _lock:
            conn = sqlite3.connect(db)
            cur = conn.cursor()
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
                    level TEXT,
                    message TEXT
                )
                """
            )
            # Create a table to store structured round data for experiments
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS rounds (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
                    meta TEXT,
                    data TEXT
                )
                """
            )
            conn.commit()
            conn.close()
    except Exception:
        # Avoid raising in init to keep app usable; print traceback for developer.
        print("Failed to initialize log DB:")
        traceback.print_exc()


def log(message: str, level: str = "INFO", path: Path = None):
    """Insert a log row into the sqlite database. If DB write fails, fallback to printing."""
    db = _db_path(path)
    try:
        with _lock:
            conn = sqlite3.connect(db)
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO logs (level, message) VALUES (?, ?)",
                (level, str(message)),
            )
            conn.commit()
            conn.close()
    except Exception:
        print(f"[LOG {level}] {message}")
        traceback.print_exc()


def save_round(metadata: dict, data: dict, path: Path = None):
    """Persist a round result as JSON in the `rounds` table.

    `metadata` should contain small experiment-level fields (difficulty, times),
    `data` is the detailed payload (items, answer, details).
    """
    import json

    db = _db_path(path)
    try:
        with _lock:
            conn = sqlite3.connect(db)
            cur = conn.cursor()
            cur.execute("INSERT INTO rounds (meta, data) VALUES (?, ?)",
                        (json.dumps(metadata), json.dumps(data)))
            conn.commit()
            conn.close()
    except Exception:
        print("Failed to save round to DB, dumping to stdout")
        print(metadata)
        print(data)
        traceback.print_exc()


def fetch_last(n: int = 20, path: Path = None):
    """Return the last `n` log rows as tuples (id, timestamp, level, message)."""
    db = _db_path(path)
    try:
        conn = sqlite3.connect(db)
        cur = conn.cursor()
        cur.execute("SELECT id, timestamp, level, message FROM logs ORDER BY id DESC LIMIT ?", (n,))
        rows = cur.fetchall()
        conn.close()
        return rows
    except Exception:
        traceback.print_exc()
        return []


__all__ = ["init_db", "log", "fetch_last"]
