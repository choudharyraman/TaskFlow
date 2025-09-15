#!/usr/bin/env python3
"""
Debug specific failing endpoints
"""

import requests
import json

BACKEND_URL = "https://focusfirst.preview.emergentagent.com/api"
TEST_USER_ID = "6da9ae17-a8a5-4bcf-9551-165483217e76"

def test_sleep_data_detailed():
    """Test sleep data with detailed error info"""
    print("Testing Sleep Data endpoint...")
    
    from datetime import date, datetime
    
    sleep_data = {
        "user_id": TEST_USER_ID,
        "sleep_date": date.today().isoformat(),
        "bedtime": datetime.now().replace(hour=23, minute=30).isoformat(),
        "wake_time": datetime.now().replace(hour=7, minute=0).isoformat(),
        "sleep_duration": 7.5,
        "sleep_quality": 8,
        "bedtime_procrastination_minutes": 30,
        "sleep_environment_score": 7,
        "caffeine_intake": [{"time": "14:00", "amount": "1 cup", "type": "coffee"}]
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/sleep/data", json=sleep_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Exception: {e}")
        return False

def test_dashboard_detailed():
    """Test dashboard endpoint with detailed error info"""
    print("\nTesting Dashboard endpoint...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/dashboard/{TEST_USER_ID}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    test_sleep_data_detailed()
    test_dashboard_detailed()