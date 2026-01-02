import google.generativeai as genai
import time
import os

# 🔑 YOUR API KEY
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class GeminiClient:
    def __init__(self):
        self.model = None
        self.model_name = 'gemini-1.5-flash'
        self.api_key_status = "not_set"
        try:
            if not GOOGLE_API_KEY:
                print("⚠️ GOOGLE_API_KEY not set - Gemini features will be disabled")
                self.api_key_status = "not_set"
                return
            
            # Check if API key looks valid (basic format check)
            if len(GOOGLE_API_KEY) < 20 or not GOOGLE_API_KEY.startswith("AIza"):
                print("⚠️ GOOGLE_API_KEY format looks invalid (should start with 'AIza')")
                self.api_key_status = "invalid_format"
                return
            
            genai.configure(api_key=GOOGLE_API_KEY)
            self.model = genai.GenerativeModel(self.model_name)
            print(f"✅ Connected to {self.model_name}")
            self.api_key_status = "configured"  # Will be validated on first use
                    
        except Exception as e:
            error_str = str(e)
            if "401" in error_str or "403" in error_str or "invalid" in error_str.lower():
                print(f"❌ API Key Error: {e}")
                self.api_key_status = "invalid"
            else:
                print(f"❌ Connection Failed: {e}")
            self.model = None

    def generate(self, prompt: str):
        """
        Generates content with YOUR automatic retry logic.
        """
        if not self.model:
            return None  # Return None so caller can handle it appropriately
        
        # ⚡ FIX 2: Your Automatic Retry Logic
        max_retries = 3
        last_error = None
        for attempt in range(max_retries):
            try:
                # print(f"🚀 Sending request to Gemini (Attempt {attempt+1})...")
                response = self.model.generate_content(prompt)
                if response and response.text:
                    # Mark API key as valid if we got a successful response
                    if self.api_key_status == "configured":
                        self.api_key_status = "valid"
                    return response.text
                else:
                    print(f"⚠️ Empty response from Gemini")
                    return None
            
            except Exception as e:
                error_str = str(e)
                last_error = error_str
                
                # Check for API key authentication errors
                if "401" in error_str or "403" in error_str or "invalid" in error_str.lower() or "unauthorized" in error_str.lower() or "permission" in error_str.lower() or "api key" in error_str.lower():
                    print(f"❌ API Key Error (Invalid/Unauthorized): {e}")
                    self.api_key_status = "invalid"  # Mark as invalid
                    return None  # Don't retry for auth errors - API key is wrong
                
                # Check for quota/rate limit errors
                elif "429" in error_str or "Quota" in error_str or "rate limit" in error_str.lower() or "quota exceeded" in error_str.lower():
                    wait_time = 5 + (attempt * 2) 
                    print(f"⚠️ Rate Limit/Quota Hit. Waiting {wait_time}s to retry...")
                    if attempt < max_retries - 1:  # Don't sleep on last attempt
                        time.sleep(wait_time)
                
                # Check for model not found errors
                elif "404" in error_str or "not found" in error_str.lower() or "model" in error_str.lower():
                    print(f"❌ Model not found: {e}")
                    return None  # Don't retry for model errors
                
                # Other API errors
                else:
                    print(f"❌ API Error: {e}")
                    if attempt < max_retries - 1:
                        time.sleep(2)  # Brief wait before retry
        
        print(f"❌ All retries failed. Last error: {last_error}")
        return None