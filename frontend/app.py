import streamlit as st
import requests

API_URL = "http://localhost:8000"

# --- TAILWIND-STYLE CSS ---
st.markdown("""
<style>
    /* Main Background */
    .stApp {
        background-color: #f8fafc; /* Slate-50 */
    }
    
    /* Headers */
    h1, h2, h3 {
        color: #1e293b; /* Slate-800 */
        font-family: 'Inter', sans-serif;
    }
    
    /* Cards/Containers */
    .stTextArea, .stSelectbox {
        background-color: white;
        border-radius: 0.5rem;
        border: 1px solid #e2e8f0;
    }
    
    /* Buttons (Mimic Tailwind bg-blue-600) */
    .stButton > button {
        background-color: #2563eb;
        color: white;
        border-radius: 0.375rem; /* rounded-md */
        border: none;
        padding: 0.5rem 1rem;
        font-weight: 600;
        transition: all 0.2s;
        width: 100%;
    }
    .stButton > button:hover {
        background-color: #1d4ed8; /* bg-blue-700 */
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    /* Success/Info Boxes */
    .stAlert {
        border-radius: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)

st.title("🚀 AI Tech Interviewer")
st.caption("Powered by RAG & Local LLMs | Supported: English, Hindi, Hinglish")

# --- SIDEBAR SETTINGS ---
with st.sidebar:
    st.header("⚙️ Configuration")
    language = st.selectbox(
        "Select Interview Language",
        ("English", "Hindi", "Hinglish")
    )
    
    if st.button("Start New Interview"):
        res = requests.post(f"{API_URL}/start_interview", json={"user_id": "user"})
        if res.status_code == 200:
            st.session_state['session_id'] = res.json()['session_id']
            st.session_state['current_q'] = None
            st.session_state['score_history'] = []
            st.success("New Session Started")
            st.rerun()

# --- MAIN INTERFACE ---
if 'session_id' in st.session_state:
    
    # Fetch Question if none exists
    if st.session_state.get('current_q') is None:
        res = requests.get(f"{API_URL}/get_question/{st.session_state['session_id']}")
        if res.status_code == 200:
            st.session_state['current_q'] = res.json()
        else:
            st.error("Could not fetch question.")

    q_data = st.session_state.get('current_q')

    if q_data:
        # Display Topic Badge
        st.markdown(f"""
        <div style="background-color: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 9999px; display: inline-block; font-weight: bold; font-size: 0.875rem; margin-bottom: 10px;">
            {q_data['difficulty']} • {q_data['topic']}
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown(f"### Q: {q_data['question']}")
        
        user_answer = st.text_area("Your Answer:", height=200, placeholder="Type your answer here...")
        
        if st.button("Submit Answer"):
            if user_answer:
                payload = {
                    "session_id": st.session_state['session_id'],
                    "question_id": q_data['id'],
                    "answer": user_answer,
                    "question_text": q_data['question'],
                    "expected_answer": q_data['expected_answer'],
                    "language": language
                }
                
                with st.spinner("🤖 AI is evaluating..."):
                    res = requests.post(f"{API_URL}/submit_answer", json=payload)
                    result = res.json()
                
                # Result Section
                st.markdown("---")
                st.markdown("### 📝 Feedback")
                
                # Color code score
                score = result['score']
                color = "#16a34a" if score >= 7 else "#ca8a04" if score >= 4 else "#dc2626"
                
                st.markdown(f"""
                <div style="padding: 1rem; background-color: white; border-left: 5px solid {color}; border-radius: 0.375rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
                    <h2 style="margin:0; color: {color};">Score: {score}/10</h2>
                    <p style="margin-top: 0.5rem; font-size: 1.1rem;">{result['feedback']}</p>
                </div>
                """, unsafe_allow_html=True)
                
                st.info(f"Next Difficulty Level: {result['next_difficulty']}")
                
                with st.expander("👁️ View Correct Solution"):
                    st.code(result['correct_solution'])
                
                if st.button("Next Question ➡️"):
                    st.session_state['current_q'] = None
                    st.rerun()
            else:
                st.warning("Please type an answer first.")
else:
    st.markdown("""
    <div style="text-align: center; padding: 50px; color: #64748b;">
        <h3>👋 Welcome!</h3>
        <p>Select a language in the sidebar and click <b>Start New Interview</b> to begin.</p>
    </div>
    """, unsafe_allow_html=True)