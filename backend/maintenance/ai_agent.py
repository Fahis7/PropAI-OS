import google.generativeai as genai
from django.conf import settings
import os
import time

GENAI_API_KEY = os.environ.get("GENAI_API_KEY")

if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

def analyze_maintenance_image(image_path, retry=False):
    if not GENAI_API_KEY:
        print("❌ AI Skipped: No API Key found.")
        return None

    try:
        # 👇 UPDATED: Using the exact name found in your logs
        model_name = 'gemini-flash-latest'
        
        print(f"🤖 Connecting to AI Model: {model_name}...")
        model = genai.GenerativeModel(model_name)
        
        # Construct full path
        img_path = os.path.join(settings.MEDIA_ROOT, str(image_path).replace('/media/', ''))
        
        if not os.path.exists(img_path):
            print(f"❌ Image not found at {img_path}")
            return None

        # Upload file
        sample_file = genai.upload_file(path=img_path, display_name="Maintenance Issue")

        prompt = """
        You are an expert Property Manager AI. 
        Analyze this image of a maintenance issue.
        
        Return a response in this exact format:
        Priority: [LOW, MEDIUM, HIGH, or EMERGENCY]
        Title: [Short professional title]
        Description: [Technical description and suggested repair]
        """

        response = model.generate_content([sample_file, prompt])
        text = response.text
        print(f"✅ AI Response: {text}")

        # Parse
        result = {'priority': 'MEDIUM', 'title': '', 'description': ''}
        
        for line in text.split('\n'):
            if "Priority:" in line:
                p_raw = line.split(":", 1)[1].strip().upper()
                if "EMERGENCY" in p_raw: result['priority'] = 'EMERGENCY'
                elif "HIGH" in p_raw: result['priority'] = 'HIGH'
                elif "LOW" in p_raw: result['priority'] = 'LOW'
            elif "Title:" in line:
                if ":" in line:
                    result['title'] = line.split(":", 1)[1].strip()
            elif "Description:" in line:
                if ":" in line:
                    result['description'] = line.split(":", 1)[1].strip()

        return result

    except Exception as e:
        # Handle Rate Limit (429) by waiting once
        if "429" in str(e) and not retry:
            print("⚠️ Quota Exceeded. Waiting 10 seconds and retrying...")
            time.sleep(10)
            return analyze_maintenance_image(image_path, retry=True)
            
        print(f"❌ AI Analysis Failed: {e}")
        return None