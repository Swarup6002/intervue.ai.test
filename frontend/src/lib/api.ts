// src/lib/api.ts

const API_URL = import.meta.env.DEV ? "http://127.0.0.1:8000" : "/api";

export async function startInterviewAPI() {
    try {
        const response = await fetch(`${API_URL}/start_interview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: "astro_user" })
        });
        return await response.json();
    } catch (error) {
        console.error("Backend Error:", error);
        return null;
    }
}

export async function getQuestionAPI(sessionId) {
    try {
        const response = await fetch(`${API_URL}/get_question/${sessionId}`);
        return await response.json();
    } catch (error) {
        console.error("Backend Error:", error);
        return null;
    }
}

export async function submitAnswerAPI(sessionId, answerText, currentQuestion) {
    try {
        const response = await fetch(`${API_URL}/submit_answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                question_id: 0,
                answer: answerText,
                question_text: currentQuestion,
                expected_answer: "check logic",
                language: "English"
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Backend Error:", error);
        return null;
    }
}