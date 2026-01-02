from api.gemini_client import GeminiClient

class QuestionEngine:
    def __init__(self):
        self.client = GeminiClient()

    def get_question(self, topic, difficulty, level, history):
        # Construct a prompt for the AI
        history_text = ""
        if history:
            # Summarize last few interactions to keep context
            recent = history[-3:] 
            history_text = f"Recent conversation: {recent}"

        prompt = f"""
        You are a technical interviewer.
        Topic: {topic}
        Difficulty: {difficulty}
        Candidate Level: {level}
        {history_text}
        Generate the next interview question. Keep it concise and relevant. Do not include the answer.
        """
        
        if not self.client or not self.client.model:
            # Fallback question if API is not configured
            return f"Explain the concept of {topic} at a {difficulty.lower()} level. What are the key aspects a {level} should know?"
        
        response = self.client.generate(prompt)
        if not response:
            # Fallback question if API call fails
            return f"Explain the concept of {topic} at a {difficulty.lower()} level. What are the key aspects a {level} should know?"
        
        return response