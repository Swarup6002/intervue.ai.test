import sqlite3
import json
import datetime
import os
import tempfile

# ✅ FORCE DB TO BE INSIDE BACKEND FOLDER
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 

# On Vercel, we must use /tmp because the code directory is read-only
if os.getenv("VERCEL"):
    DB_NAME = os.path.join(tempfile.gettempdir(), "interview.db")
else:
    DB_NAME = os.path.join(BASE_DIR, "interview.db")

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Create table with user_id
    c.execute('''CREATE TABLE IF NOT EXISTS sessions 
                 (session_id TEXT PRIMARY KEY, 
                  user_id TEXT, 
                  difficulty TEXT, 
                  history TEXT,
                  created_at TEXT)''')
    conn.commit()
    conn.close()

def get_session(session_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT difficulty, history, user_id FROM sessions WHERE session_id=?", (session_id,))
    row = c.fetchone()
    conn.close()
    
    if row:
        difficulty = row[0]
        history_str = row[1]
        try:
            history = json.loads(history_str)
        except:
            history = []
        return (difficulty, history)
    return None

def get_user_sessions(user_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT session_id, history, created_at, difficulty FROM sessions WHERE user_id=? ORDER BY created_at DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    
    sessions = []
    for r in rows:
        sid = r[0]
        hist_str = r[1]
        created_at = r[2]
        difficulty = r[3]
        try:
            hist = json.loads(hist_str)
            topic = "General Coding"
            # Extract topic safely
            if hist and len(hist) > 0 and isinstance(hist[0], dict):
                topic = hist[0].get("topic", "General Coding")
            
            # Count Q&A pairs (excluding metadata)
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

def update_session(session_id, difficulty, history, user_id=None):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    history_json = json.dumps(history)
    
    if user_id:
        created_at = datetime.datetime.now().isoformat()
        c.execute("INSERT OR REPLACE INTO sessions (session_id, user_id, difficulty, history, created_at) VALUES (?, ?, ?, ?, ?)", 
                  (session_id, user_id, difficulty, history_json, created_at))
    else:
        c.execute("UPDATE sessions SET difficulty=?, history=? WHERE session_id=?", 
                  (difficulty, history_json, session_id))
        
    conn.commit()
    conn.close()