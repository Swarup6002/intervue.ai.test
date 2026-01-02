from api.gemini_client import GeminiClient
import json
import re

class Evaluator:
    def __init__(self):
        self.client = GeminiClient()

    def evaluate(self, question, user_answer, language="English"):
        print(f"🚀 Evaluator: Analyzing answer...")

        # Check if client is available
        if not self.client or not self.client.model:
            return {
                "score": 5,
                "feedback": "AI evaluation is not available. Your answer has been recorded. Please ensure GOOGLE_API_KEY is configured for AI-powered feedback.",
                "correct_solution": "N/A"
            }

        # ✅ Your Prompt Structure
        prompt = f"""
        You are a Technical Interviewer.
        
        Context:
        - Question: {question}
        - Candidate Answer: {user_answer}
        
        Task:
        1. Compare the Candidate Answer with the technical facts.
        2. Provide feedback in the requested language: {language}.
        
        Output Format (Strict JSON):
        {{
            "score": 0,
            "feedback": "...",
            "correct_solution": "..."
        }}
        
        IMPORTANT: Return ONLY the JSON. No markdown formatting.
        """

        response_text = self.client.generate(prompt)

        # 1. Handle Network/API Failures
        if not response_text:
            # Check API key status for better error message
            api_key_status = getattr(self.client, 'api_key_status', 'unknown')
            if api_key_status == "invalid" or api_key_status == "invalid_format":
                return {
                    "score": 5,
                    "feedback": "API key is invalid or not authorized. Please check your GOOGLE_API_KEY in Vercel settings. Your answer has been recorded.",
                    "correct_solution": "N/A"
                }
            elif api_key_status == "not_set":
                return {
                    "score": 5,
                    "feedback": "API key is not configured. Please set GOOGLE_API_KEY environment variable in Vercel settings. Your answer has been recorded.",
                    "correct_solution": "N/A"
                }
            else:
                # Rate limit or other API errors (client exists but API call failed)
                return {
                    "score": 5,
                    "feedback": "AI service is temporarily unavailable (rate limit, quota exceeded, or service error). Your answer has been recorded. Please try again in a moment or check your API quota.",
                    "correct_solution": "N/A"
                }

        # 2. Robust JSON Parsing (Fixes "Could not process answer")
        try:
            # Use Regex to extract JSON object even if Gemini adds text around it
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                json_str = match.group(0)
                return json.loads(json_str)
            else:
                # Fallback if no JSON found
                return {
                    "score": 0,
                    "feedback": response_text[:200], # Return raw text as feedback
                    "correct_solution": "N/A"
                }

        except Exception as e:
            print(f"❌ Parsing Error: {e}")
            return {
                "score": 0,
                "feedback": "Error parsing AI response.",
                "correct_solution": "N/A"
            }