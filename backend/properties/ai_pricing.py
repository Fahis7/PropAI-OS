import google.generativeai as genai
import os
import json
import time

from .market_data import get_market_data

GENAI_API_KEY = os.environ.get("GENAI_API_KEY")

if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)


def analyze_rent_price(unit, retry=False):
    """
    Smart Rent Pricing Engine — Uses Gemini AI + Dubai market data
    to recommend optimal rent for a unit.
    """
    # 1. Get property info
    property_name = unit.property.name if unit.property else "Unknown"
    property_address = unit.property.address if unit.property else "Dubai"
    property_city = unit.property.city if unit.property else "Dubai"

    # 2. Get market comparables
    market = get_market_data(property_address, unit.unit_type)

    # 3. Build context
    unit_info = {
        "unit_number": unit.unit_number,
        "type": unit.unit_type,
        "bedrooms": unit.bedrooms,
        "bathrooms": float(unit.bathrooms),
        "square_feet": unit.square_feet,
        "current_rent": float(unit.yearly_rent),
        "status": unit.status,
        "property_name": property_name,
        "property_address": property_address,
        "city": property_city,
    }

    market_info = {
        "matched_area": market["area"],
        "market_min": market["min"],
        "market_avg": market["avg"],
        "market_max": market["max"],
    }

    # 4. If no API key, return market-data-only response
    if not GENAI_API_KEY:
        print("⚠️ No Gemini API key — returning market data only")
        return build_fallback_response(unit_info, market_info)

    # 5. Call Gemini AI
    try:
        model = genai.GenerativeModel('gemini-flash-latest')

        prompt = f"""
You are an expert Dubai real estate rental analyst. Analyze this unit and provide a smart rent recommendation.

UNIT DETAILS:
- Property: {unit_info['property_name']}
- Address: {unit_info['property_address']}
- Unit: {unit_info['unit_number']} ({unit_info['type']})
- Bedrooms: {unit_info['bedrooms']} | Bathrooms: {unit_info['bathrooms']}
- Size: {unit_info['square_feet'] or 'Unknown'} sq ft
- Current Rent: AED {unit_info['current_rent']:,.0f}/year

MARKET DATA FOR {market_info['matched_area']}:
- Market Minimum: AED {market_info['market_min']:,}/year
- Market Average: AED {market_info['market_avg']:,}/year
- Market Maximum: AED {market_info['market_max']:,}/year

Respond ONLY with valid JSON in this exact format (no markdown, no backticks):
{{
    "recommended_low": <number>,
    "recommended_mid": <number>,
    "recommended_high": <number>,
    "confidence": <number 1-100>,
    "verdict": "<one of: UNDERPRICED, FAIR, OVERPRICED, PREMIUM>",
    "reasoning": "<2-3 sentences explaining the recommendation>",
    "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}}
"""

        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean JSON
        text = text.replace("```json", "").replace("```", "").strip()
        
        print(f"🤖 AI Pricing Response: {text}")

        ai_result = json.loads(text)

        return {
            "success": True,
            "source": "AI",
            "unit": unit_info,
            "market": market_info,
            "recommendation": {
                "low": ai_result.get("recommended_low", market_info["market_min"]),
                "mid": ai_result.get("recommended_mid", market_info["market_avg"]),
                "high": ai_result.get("recommended_high", market_info["market_max"]),
                "confidence": ai_result.get("confidence", 75),
                "verdict": ai_result.get("verdict", "FAIR"),
                "reasoning": ai_result.get("reasoning", "Based on market data analysis."),
                "tips": ai_result.get("tips", []),
            }
        }

    except json.JSONDecodeError as e:
        print(f"❌ AI returned invalid JSON: {e}")
        return build_fallback_response(unit_info, market_info)

    except Exception as e:
        if "429" in str(e) and not retry:
            print("⚠️ Quota exceeded. Retrying in 10s...")
            time.sleep(10)
            return analyze_rent_price(unit, retry=True)

        print(f"❌ AI Pricing Failed: {e}")
        return build_fallback_response(unit_info, market_info)


def build_fallback_response(unit_info, market_info):
    """
    Fallback when AI is unavailable — uses pure market data comparison.
    """
    current = unit_info["current_rent"]
    avg = market_info["market_avg"]
    min_rent = market_info["market_min"]
    max_rent = market_info["market_max"]

    # Determine verdict
    if current < min_rent:
        verdict = "UNDERPRICED"
        reasoning = f"Current rent (AED {current:,.0f}) is below the market minimum (AED {min_rent:,}). Consider increasing to capture market value."
    elif current > max_rent:
        verdict = "OVERPRICED"
        reasoning = f"Current rent (AED {current:,.0f}) exceeds the market maximum (AED {max_rent:,}). This may lead to longer vacancy periods."
    elif current > avg * 1.1:
        verdict = "PREMIUM"
        reasoning = f"Current rent (AED {current:,.0f}) is above market average (AED {avg:,}). This is sustainable if the unit has premium features."
    else:
        verdict = "FAIR"
        reasoning = f"Current rent (AED {current:,.0f}) is within market range (AED {min_rent:,} - {max_rent:,}). Well positioned for the area."

    # Calculate recommendation based on market
    recommended_low = int(min_rent + (avg - min_rent) * 0.3)
    recommended_mid = avg
    recommended_high = int(avg + (max_rent - avg) * 0.5)

    return {
        "success": True,
        "source": "MARKET_DATA",
        "unit": unit_info,
        "market": market_info,
        "recommendation": {
            "low": recommended_low,
            "mid": recommended_mid,
            "high": recommended_high,
            "confidence": 65,
            "verdict": verdict,
            "reasoning": reasoning,
            "tips": [
                "Consider unit condition and recent renovations",
                "Check competitor listings on Bayut and Dubizzle",
                "Factor in building amenities (pool, gym, parking)",
            ],
        }
    }