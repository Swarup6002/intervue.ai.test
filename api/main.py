import sys
import os

# Fix imports so they work from anywhere (including Vercel)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import uvicorn
import json

from api.database import init_db, get_session, update_session, get_user_sessions
from api.question_engine import QuestionEngine
from api.evaluator import Evaluator
from api.difficulty_controller import DifficultyController

# For Vercel: When request comes to /api/start_interview, it routes to /api/main.py
# The path that reaches FastAPI will be /api/start_interview
# We need root_path="/api" to strip the prefix so routes match correctly
# Using root_path works for both local (no prefix) and Vercel (with /api prefix)
app = FastAPI(title="AI Interviewer", root_path="/api" if os.getenv("VERCEL") else "")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INITIALIZATION ---
print("🚀 Starting AI Interviewer Backend...")
try:
    init_db()
    print("✅ Database initialized")
except Exception as e:
    print(f"⚠️ Database init warning: {e}")

try:
    q_engine = QuestionEngine()
    print("✅ QuestionEngine initialized")
except Exception as e:
    print(f"⚠️ QuestionEngine init warning: {e}")
    q_engine = None

try:
    evaluator = Evaluator()
    print("✅ Evaluator initialized")
except Exception as e:
    print(f"⚠️ Evaluator init warning: {e}")
    evaluator = None

try:
    diff_controller = DifficultyController()
    print("✅ DifficultyController initialized")
except Exception as e:
    print(f"⚠️ DifficultyController init warning: {e}")
    diff_controller = None

print("✅ Backend Ready!")

# --- MODELS ---
class StartRequest(BaseModel):
    user_id: str
    topic: str = "General Coding"
    experience_level: str = "Fresher"

class AnswerRequest(BaseModel):
    session_id: str
    question_text: str
    answer: str

# --- ENDPOINTS ---

@app.get("/")
@app.get("/health")
def health_check():
    """Health check endpoint"""
    api_key_status = "unknown"
    if q_engine and q_engine.client:
        api_key_status = q_engine.client.api_key_status
    elif evaluator and evaluator.client:
        api_key_status = evaluator.client.api_key_status
    
    return {
        "status": "ok", 
        "message": "Backend is running", 
        "vercel": os.getenv("VERCEL", "false"),
        "api_key_status": api_key_status,
        "components": {
            "database": "ok",
            "question_engine": "ok" if q_engine else "not initialized",
            "evaluator": "ok" if evaluator else "not initialized",
            "difficulty_controller": "ok" if diff_controller else "not initialized"
        }
    }

@app.get("/my_sessions/{user_id}")
def get_my_sessions(user_id: str):
    """Return a list of past interviews for the user."""
    sessions = get_user_sessions(user_id)
    return {"sessions": sessions}

@app.post("/start_interview")
def start_interview(req: StartRequest):
    session_id = str(uuid.uuid4())
    initial_history = [{"meta": "init", "topic": req.topic, "level": req.experience_level}]
    update_session(session_id, "Easy", initial_history, user_id=req.user_id)
    print(f"✅ Session Started: {req.topic} | Level: {req.experience_level}")
    return {"session_id": session_id, "message": "Interview Started"}

@app.get("/get_question/{session_id}")
def get_next_question(session_id: str):
    session_data = get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    current_diff = session_data[0]
    history = session_data[1]
    
    topic = "General Coding"
    level = "Fresher"

    if history and isinstance(history, list) and len(history) > 0:
        if isinstance(history[0], dict):
            topic = history[0].get("topic", "General Coding")
            level = history[0].get("level", "Fresher")

    try:
        if q_engine:
            question_text = q_engine.get_question(topic, current_diff, level, history)
        else:
            question_text = f"Tell me about {topic} at {current_diff} level."
        return {
            "question": question_text,
            "difficulty": current_diff,
            "topic": topic,
            "history": history
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"question": f"Tell me about {topic}.", "difficulty": "Easy", "topic": topic}

@app.post("/submit_answer")
def submit_answer(req: AnswerRequest):
    if evaluator:
        evaluation = evaluator.evaluate(req.question_text, req.answer)
        score = evaluation.get("score", 0)
        feedback = evaluation.get("feedback", "")
        correct_solution = evaluation.get("correct_solution", "")
    else:
        # Fallback if evaluator not initialized
        score = 5
        feedback = "Evaluation service not available. Please configure GOOGLE_API_KEY."
        correct_solution = "N/A"
    
    session_data = get_session(req.session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")

    current_diff = session_data[0]
    history = session_data[1]
    
    if diff_controller:
        new_diff = diff_controller.adjust_difficulty(current_diff, score)
    else:
        new_diff = current_diff
    
    history.append({
        "question": req.question_text,
        "answer": req.answer,
        "score": score,
        "feedback": feedback
    })
    
    update_session(req.session_id, new_diff, history, user_id=None)
    
    return {
        "score": score,
        "feedback": feedback,
        "next_difficulty": new_diff,
        "correct_solution": correct_solution
    }

# Debug route to catch all unmatched paths
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def catch_all(path: str, request: Request):
    """Catch-all route for debugging - shows what path was received"""
    return {
        "error": "Route not found",
        "received_path": path,
        "full_url": str(request.url),
        "method": request.method,
        "available_routes": ["/", "/health", "/start_interview", "/get_question/{session_id}", "/submit_answer", "/my_sessions/{user_id}"],
        "root_path": app.root_path,
        "vercel_env": os.getenv("VERCEL", "not set")
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)