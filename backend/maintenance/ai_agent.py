import os
import base64
import time
from django.conf import settings

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")


def analyze_maintenance_image(image_path, retry=False):
    """
    Analyze maintenance issue image using Groq Llama Vision (FREE).
    Falls back to keyword-based analysis if no API key.
    """
    if not GROQ_API_KEY:
        print("❌ AI Vision Skipped: No GROQ_API_KEY found.")
        return None

    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        # Construct full path
        img_path = os.path.join(settings.MEDIA_ROOT, str(image_path).replace('/media/', ''))

        if not os.path.exists(img_path):
            print(f"❌ Image not found at {img_path}")
            return None

        # Read and encode image to base64
        with open(img_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

        # Detect mime type
        ext = os.path.splitext(img_path)[1].lower()
        mime_map = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif'}
        mime_type = mime_map.get(ext, 'image/jpeg')

        print(f"🤖 Analyzing image with Groq Llama Vision...")

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_data}"
                            }
                        },
                        {
                            "type": "text",
                            "text": """You are an expert Property Maintenance AI for Dubai buildings.
Analyze this image of a maintenance issue.

Return your response in this EXACT format (one per line):
Priority: [LOW, MEDIUM, HIGH, or EMERGENCY]
Title: [Short professional title, max 10 words]
Description: [Technical description of the issue and suggested repair action, 1-2 sentences]

Priority guidelines:
- EMERGENCY: Flooding, fire damage, gas leak, structural collapse, exposed wiring
- HIGH: Major water leak, AC completely broken, broken window/door, sewage backup
- MEDIUM: Minor leak, cracked tile, paint peeling, appliance malfunction
- LOW: Cosmetic damage, minor scratch, small stain, loose handle"""
                        }
                    ]
                }
            ],
            max_tokens=300,
            temperature=0.1,
        )

        text = response.choices[0].message.content
        print(f"✅ Groq Vision Response: {text}")

        # Parse response
        result = {'priority': 'MEDIUM', 'title': '', 'description': ''}

        for line in text.split('\n'):
            line = line.strip()
            if line.startswith("Priority:"):
                p_raw = line.split(":", 1)[1].strip().upper()
                if "EMERGENCY" in p_raw:
                    result['priority'] = 'EMERGENCY'
                elif "HIGH" in p_raw:
                    result['priority'] = 'HIGH'
                elif "LOW" in p_raw:
                    result['priority'] = 'LOW'
                else:
                    result['priority'] = 'MEDIUM'
            elif line.startswith("Title:"):
                result['title'] = line.split(":", 1)[1].strip()
            elif line.startswith("Description:"):
                result['description'] = line.split(":", 1)[1].strip()

        return result

    except Exception as e:
        if "429" in str(e) and not retry:
            print("⚠️ Rate limit hit. Waiting 10 seconds and retrying...")
            time.sleep(10)
            return analyze_maintenance_image(image_path, retry=True)

        print(f"❌ Groq Vision Analysis Failed: {e}")
        return None