import json
import os
import google.generativeai as genai
import time

# ✅ YOUR API KEY
GOOGLE_API_KEY = "AIzaSyCh_smoqcA3cIy376_ScwrvCFyy4a6iNrU"

def generate_questions():
    print("🤖 Connecting to Gemini to generate new questions...")
    
    genai.configure(api_key=GOOGLE_API_KEY)
    
    # ⚡ FIX: Use the stable model (same as your backend)
    model = genai.GenerativeModel('models/gemini-flash-latest') 

    prompt = """
    Generate 5 technical interview questions for a Full Stack Developer role.
    Include a mix of: Python, SQL, React, and System Design.
    
    Output strictly in this JSON format (no markdown, just the raw array):
    [
        {
            "id": "unique_id_1",
            "question": "Question text here?",
            "topic": "Topic Name",
            "difficulty": "Medium",
            "expected_answer": "Short summary of the expected answer."
        }
    ]
    """

    try:
        response = model.generate_content(prompt)
        text = response.text
        
        # Clean up if Gemini adds markdown
        if "```" in text:
            text = text.replace("```json", "").replace("```", "")
        
        new_questions = json.loads(text)
        print(f"✅ Generated {len(new_questions)} new questions!")
        return new_questions

    except Exception as e:
        print(f"❌ Error generating questions: {e}")
        return []

def save_to_file(new_data):
    # ⚡ THIS IS WHERE IT SAVES
    file_path = "data/questions.json"
    
    # 1. Load existing questions
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            try:
                existing_data = json.load(f)
            except:
                existing_data = []
    else:
        existing_data = []

    # 2. Add IDs
    current_count = len(existing_data)
    for q in new_data:
        current_count += 1
        q["id"] = str(current_count) 

    # 3. Merge
    combined = existing_data + new_data
    
    # 4. Save back
    with open(file_path, "w") as f:
        json.dump(combined, f, indent=4)
    
    print(f"💾 Saved! Check 'data/questions.json'. Total questions: {len(combined)}")

if __name__ == "__main__":
    questions = generate_questions()
    if questions:
        save_to_file(questions)