import os
import json
import datetime
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse

# ---------------------------------------------------------
# ✅ DATABASE CONFIGURATION
# ---------------------------------------------------------
# Get DB URL from Vercel Environment Variables (Supabase)
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """
    Connects to Supabase (Postgres) if DATABASE_URL is set.
    Otherwise, falls back to local SQLite (safe for Vercel tmp).
    """
    if DATABASE_URL:
        try:
            conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
            return conn, "postgres"
        except Exception as e:
            print(f"❌ Database Connection Failed: {e}")
            return None, None
    else:
        # Fallback to local SQLite (using /tmp for Vercel compatibility)
        db_path = "/tmp/interview.db"
        conn = sqlite3.connect(db_path)
        # Enable dictionary-like access for SQLite rows so logic stays the same
        conn.row_factory = sqlite3.Row 
        return conn, "sqlite"

def init_db():
    """Initializes the table in either Postgres or SQLite."""
    conn, db_type = get_db_connection()
    if not conn: return

    try:
        if db_type == "postgres":
            # PostgreSQL Syntax (Supabase)
            with conn.cursor() as c:
                c.execute('''CREATE TABLE IF NOT EXISTS sessions 
                             (session_id TEXT PRIMARY KEY, 
                              user_id TEXT, 
                              difficulty TEXT, 
                              history TEXT,
                              created_at TEXT)''')
                conn.commit()
        else:
            # SQLite Syntax (Local/Temp)
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS sessions 
                         (session_id TEXT PRIMARY KEY, 
                          user_id TEXT, 
                          difficulty TEXT, 
                          history TEXT,
                          created_at TEXT)''')
            conn.commit()
    finally:
        conn.close()

def get_session(session_id):
    """Fetches a single session by ID."""
    conn, db_type = get_db_connection()
    if not conn: return None

    try:
        c = conn.cursor()
        # Parameter marker differs: %s for Postgres, ? for SQLite
        placeholder = "%s" if db_type == "postgres" else "?"
        
        c.execute(f"SELECT difficulty, history, user_id FROM sessions WHERE session_id={placeholder}", (session_id,))
        row = c.fetchone()
        
        if row:
            # Access by key works for both RealDictCursor (Postgres) and sqlite3.Row
            difficulty = row['difficulty'] if db_type == "postgres" else row[0]
            history_str = row['history'] if db_type == "postgres" else row[1]
            
            try:
                history = json.loads(history_str)
            except:
                history = []
            return (difficulty, history)
        return None
    finally:
        conn.close()

def get_user_sessions(user_id):
    """Fetches all sessions for a specific user."""
    conn, db_type = get_db_connection()
    if not conn: return []

    try:
        c = conn.cursor()
        placeholder = "%s" if db_type == "postgres" else "?"
        
        c.execute(f"SELECT session_id, history, created_at, difficulty FROM sessions WHERE user_id={placeholder} ORDER BY created_at DESC", (user_id,))
        rows = c.fetchall()
        
        sessions = []
        for r in rows:
            # Handle row access differences carefully
            if db_type == "postgres":
                sid = r['session_id']
                hist_str = r['history']
                created_at = r['created_at']
                difficulty = r['difficulty']
            else:
                sid = r[0]
                hist_str = r[1]
                created_at = r[2]
                difficulty = r[3]

            try:
                hist = json.loads(hist_str)
                topic = "General Coding"
                if hist and len(hist) > 0 and isinstance(hist[0], dict):
                    topic = hist[0].get("topic", "General Coding")
                
                q_count = max(0, len(hist) - 1)
                
                sessions.append({
                    "session_id": sid,
                    "topic": topic,
                    "created_at": created_at,
                    "questions_count": q_count,
                    "difficulty": difficulty
                })
            except:
                continue
        return sessions
    finally:
        conn.close()

def update_session(session_id, difficulty, history, user_id=None):
    """Updates or creates a session."""
    conn, db_type = get_db_connection()
    if not conn: return

    try:
        c = conn.cursor()
        history_json = json.dumps(history)
        placeholder = "%s" if db_type == "postgres" else "?"
        
        if user_id:
            created_at = datetime.datetime.now().isoformat()
            if db_type == "postgres":
                # Postgres Upsert (Insert or Update on Conflict)
                query = """
                    INSERT INTO sessions (session_id, user_id, difficulty, history, created_at) 
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (session_id) 
                    DO UPDATE SET difficulty = EXCLUDED.difficulty, history = EXCLUDED.history;
                """
                c.execute(query, (session_id, user_id, difficulty, history_json, created_at))
            else:
                # SQLite Upsert
                c.execute("INSERT OR REPLACE INTO sessions (session_id, user_id, difficulty, history, created_at) VALUES (?, ?, ?, ?, ?)", 
                          (session_id, user_id, difficulty, history_json, created_at))
        else:
            # Update Only (for anonymous or ongoing sessions)
            c.execute(f"UPDATE sessions SET difficulty={placeholder}, history={placeholder} WHERE session_id={placeholder}", 
                      (difficulty, history_json, session_id))
            
        conn.commit()
    finally:
        conn.close()