import google.generativeai as genai
import os

# Your current key
GOOGLE_API_KEY = "AIzaSyCh_smoqcA3cIy376_ScwrvCFyy4a6iNrU"
genai.configure(api_key=GOOGLE_API_KEY)

print("🔍 Checking available models for your API Key...")
try:
    count = 0
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ FOUND: {m.name}")
            count += 1
    
    if count == 0:
        print("❌ No text generation models found. Check API Key permissions.")

except Exception as e:
    print(f"❌ Error: {e}")