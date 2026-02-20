"""
Dubai Rental Market Data — Used by the Smart Pricing Engine.
Based on real Dubai market averages by area and unit type.
"""

DUBAI_MARKET_DATA = {
    "Dubai Marina": {
        "STUDIO": {"min": 45000, "avg": 58000, "max": 75000},
        "1BHK": {"min": 65000, "avg": 80000, "max": 100000},
        "2BHK": {"min": 95000, "avg": 120000, "max": 155000},
        "3BHK": {"min": 140000, "avg": 175000, "max": 220000},
        "OFFICE": {"min": 80000, "avg": 110000, "max": 160000},
        "RETAIL": {"min": 150000, "avg": 220000, "max": 350000},
    },
    "Downtown Dubai": {
        "STUDIO": {"min": 55000, "avg": 70000, "max": 90000},
        "1BHK": {"min": 80000, "avg": 100000, "max": 130000},
        "2BHK": {"min": 120000, "avg": 150000, "max": 200000},
        "3BHK": {"min": 180000, "avg": 230000, "max": 300000},
        "OFFICE": {"min": 100000, "avg": 140000, "max": 200000},
        "RETAIL": {"min": 200000, "avg": 300000, "max": 500000},
    },
    "JBR": {
        "STUDIO": {"min": 50000, "avg": 65000, "max": 80000},
        "1BHK": {"min": 70000, "avg": 88000, "max": 110000},
        "2BHK": {"min": 110000, "avg": 135000, "max": 170000},
        "3BHK": {"min": 160000, "avg": 200000, "max": 260000},
    },
    "Business Bay": {
        "STUDIO": {"min": 40000, "avg": 52000, "max": 65000},
        "1BHK": {"min": 58000, "avg": 72000, "max": 90000},
        "2BHK": {"min": 85000, "avg": 105000, "max": 135000},
        "3BHK": {"min": 120000, "avg": 155000, "max": 200000},
        "OFFICE": {"min": 70000, "avg": 95000, "max": 140000},
    },
    "JLT": {
        "STUDIO": {"min": 35000, "avg": 45000, "max": 58000},
        "1BHK": {"min": 50000, "avg": 62000, "max": 78000},
        "2BHK": {"min": 75000, "avg": 90000, "max": 115000},
        "3BHK": {"min": 100000, "avg": 130000, "max": 165000},
        "OFFICE": {"min": 55000, "avg": 75000, "max": 100000},
    },
    "Palm Jumeirah": {
        "STUDIO": {"min": 65000, "avg": 80000, "max": 100000},
        "1BHK": {"min": 90000, "avg": 115000, "max": 150000},
        "2BHK": {"min": 140000, "avg": 180000, "max": 240000},
        "3BHK": {"min": 200000, "avg": 270000, "max": 380000},
        "VILLA": {"min": 300000, "avg": 450000, "max": 700000},
    },
    "Al Barsha": {
        "STUDIO": {"min": 28000, "avg": 35000, "max": 45000},
        "1BHK": {"min": 40000, "avg": 50000, "max": 65000},
        "2BHK": {"min": 60000, "avg": 75000, "max": 95000},
        "3BHK": {"min": 85000, "avg": 105000, "max": 135000},
    },
    "Deira": {
        "STUDIO": {"min": 22000, "avg": 30000, "max": 40000},
        "1BHK": {"min": 35000, "avg": 45000, "max": 55000},
        "2BHK": {"min": 50000, "avg": 65000, "max": 80000},
        "3BHK": {"min": 70000, "avg": 90000, "max": 110000},
        "RETAIL": {"min": 80000, "avg": 120000, "max": 180000},
        "WAREHOUSE": {"min": 60000, "avg": 90000, "max": 140000},
    },
    "Default": {
        "STUDIO": {"min": 30000, "avg": 45000, "max": 60000},
        "1BHK": {"min": 45000, "avg": 60000, "max": 80000},
        "2BHK": {"min": 70000, "avg": 90000, "max": 120000},
        "3BHK": {"min": 100000, "avg": 130000, "max": 170000},
        "VILLA": {"min": 150000, "avg": 200000, "max": 300000},
        "OFFICE": {"min": 60000, "avg": 85000, "max": 120000},
        "RETAIL": {"min": 100000, "avg": 150000, "max": 250000},
        "WAREHOUSE": {"min": 50000, "avg": 75000, "max": 120000},
    },
}


def get_market_data(area_name, unit_type):
    """
    Find the best matching market data for the given area and unit type.
    Falls back to 'Default' if area not found.
    """
    # Try exact match first
    for area_key in DUBAI_MARKET_DATA:
        if area_key.lower() in area_name.lower() or area_name.lower() in area_key.lower():
            area_data = DUBAI_MARKET_DATA[area_key]
            if unit_type in area_data:
                return {"area": area_key, **area_data[unit_type]}
    
    # Fallback to Default
    default = DUBAI_MARKET_DATA["Default"]
    if unit_type in default:
        return {"area": "Dubai (General)", **default[unit_type]}
    
    return {"area": "Unknown", "min": 30000, "avg": 50000, "max": 80000}