#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Anti-Procrastination Productivity App
Tests all major API endpoints and functionality
"""

import requests
import json
import uuid
from datetime import datetime, date
import time
import sys
import os

# Backend URL from environment
BACKEND_URL = "https://focusflow-53.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response_data"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def test_server_health(self):
        """Test if server is running and accessible"""
        try:
            response = requests.get(f"{self.base_url}/users/health-check", timeout=10)
            # Even if endpoint doesn't exist, we should get a response from the server
            self.log_test("Server Health Check", True, f"Server responding (status: {response.status_code})")
            return True
        except requests.exceptions.RequestException as e:
            self.log_test("Server Health Check", False, f"Server not accessible: {str(e)}")
            return False
    
    def test_user_creation(self):
        """Test user creation endpoint"""
        try:
            user_data = {
                "email": "testuser@productivity.com",
                "username": "productivitytester",
                "password": "securepassword123"
            }
            
            response = requests.post(f"{self.base_url}/users", json=user_data, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                user = response.json()
                self.test_user_id = user.get("id")
                self.log_test("User Creation", True, f"User created successfully with ID: {self.test_user_id}")
                return True
            else:
                self.log_test("User Creation", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Creation", False, f"Exception: {str(e)}")
            return False
    
    def test_user_retrieval(self):
        """Test user retrieval endpoint"""
        if not self.test_user_id:
            self.log_test("User Retrieval", False, "No test user ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/users/{self.test_user_id}", timeout=10)
            
            if response.status_code == 200:
                user = response.json()
                self.log_test("User Retrieval", True, f"User retrieved successfully: {user.get('username')}")
                return True
            else:
                self.log_test("User Retrieval", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Retrieval", False, f"Exception: {str(e)}")
            return False
    
    def test_cbt_thought_record(self):
        """Test CBT thought record creation"""
        if not self.test_user_id:
            self.log_test("CBT Thought Record", False, "No test user ID available")
            return False
            
        try:
            thought_record = {
                "user_id": self.test_user_id,
                "trigger_situation": "Feeling overwhelmed by work tasks",
                "automatic_thoughts": ["I'll never finish this", "I'm not good enough"],
                "emotions": ["anxiety", "frustration"],
                "emotion_intensity": {"anxiety": 8, "frustration": 6},
                "physical_sensations": ["tight chest", "racing heart"],
                "behaviors": ["procrastination", "avoidance"],
                "evidence_for": ["Task seems complex"],
                "evidence_against": ["I've completed similar tasks before"],
                "balanced_thoughts": ["I can break this down into smaller steps"],
                "outcome_emotions": {"anxiety": 4, "frustration": 3},
                "coping_strategies_used": ["deep breathing", "task breakdown"],
                "effectiveness_rating": 7
            }
            
            response = requests.post(f"{self.base_url}/cbt/thought-records", json=thought_record, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                self.log_test("CBT Thought Record", True, "Thought record created successfully")
                return True
            else:
                self.log_test("CBT Thought Record", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("CBT Thought Record", False, f"Exception: {str(e)}")
            return False
    
    def test_pomodoro_session(self):
        """Test Pomodoro session creation"""
        if not self.test_user_id:
            self.log_test("Pomodoro Session", False, "No test user ID available")
            return False
            
        try:
            pomodoro_session = {
                "user_id": self.test_user_id,
                "task_name": "Complete project documentation",
                "work_duration": 25,
                "break_duration": 5,
                "focus_quality_ratings": [8, 7, 9, 8],
                "distractions": [{"type": "phone", "duration": 2}],
                "break_activities": ["stretch", "water"],
                "completion_status": "completed",
                "productivity_score": 8.5
            }
            
            response = requests.post(f"{self.base_url}/pomodoro/sessions", json=pomodoro_session, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                self.log_test("Pomodoro Session", True, "Pomodoro session created successfully")
                return True
            else:
                self.log_test("Pomodoro Session", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Pomodoro Session", False, f"Exception: {str(e)}")
            return False
    
    def test_mindfulness_session(self):
        """Test mindfulness meditation session"""
        if not self.test_user_id:
            self.log_test("Mindfulness Session", False, "No test user ID available")
            return False
            
        try:
            meditation_session = {
                "user_id": self.test_user_id,
                "meditation_type": "focused_breathing",
                "duration_planned": 10,
                "duration_actual": 8,
                "completion_rate": 0.8,
                "pre_session_state": {"stress": 7, "focus": 4},
                "post_session_state": {"stress": 4, "focus": 7},
                "focus_quality": 7,
                "insights": ["Noticed mind wandering less", "Felt more centered"]
            }
            
            response = requests.post(f"{self.base_url}/mindfulness/sessions", json=meditation_session, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                self.log_test("Mindfulness Session", True, "Mindfulness session created successfully")
                return True
            else:
                self.log_test("Mindfulness Session", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Mindfulness Session", False, f"Exception: {str(e)}")
            return False
    
    def test_implementation_intention(self):
        """Test implementation intention creation"""
        if not self.test_user_id:
            self.log_test("Implementation Intention", False, "No test user ID available")
            return False
            
        try:
            intention = {
                "user_id": self.test_user_id,
                "if_condition": "When I feel the urge to check social media",
                "then_action": "I will take three deep breaths and return to my current task",
                "context_triggers": ["phone notification", "boredom", "task difficulty"]
            }
            
            response = requests.post(f"{self.base_url}/intentions", json=intention, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                self.log_test("Implementation Intention", True, "Implementation intention created successfully")
                return True
            else:
                self.log_test("Implementation Intention", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Implementation Intention", False, f"Exception: {str(e)}")
            return False
    
    def test_five_minute_rule(self):
        """Test five-minute rule session"""
        if not self.test_user_id:
            self.log_test("Five Minute Rule", False, "No test user ID available")
            return False
            
        try:
            session = {
                "user_id": self.test_user_id,
                "task_name": "Organize desk workspace",
                "micro_action_taken": "Cleared one corner of desk",
                "continued_beyond_five": True,
                "total_duration": 15,
                "momentum_created": True,
                "energy_before": 4,
                "energy_after": 7
            }
            
            response = requests.post(f"{self.base_url}/five-minute/sessions", json=session, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                self.log_test("Five Minute Rule", True, "Five-minute rule session created successfully")
                return True
            else:
                self.log_test("Five Minute Rule", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Five Minute Rule", False, f"Exception: {str(e)}")
            return False
    
    def test_physical_activity(self):
        """Test physical activity session"""
        if not self.test_user_id:
            self.log_test("Physical Activity", False, "No test user ID available")
            return False
            
        try:
            activity = {
                "user_id": self.test_user_id,
                "activity_type": "brisk_walk",
                "duration": 20,
                "intensity": 6,
                "mood_before": 5,
                "mood_after": 8,
                "energy_before": 4,
                "energy_after": 7,
                "procrastination_level_before": 8,
                "procrastination_level_after": 4
            }
            
            response = requests.post(f"{self.base_url}/activity/sessions", json=activity, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                self.log_test("Physical Activity", True, "Physical activity session created successfully")
                return True
            else:
                self.log_test("Physical Activity", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Physical Activity", False, f"Exception: {str(e)}")
            return False
    
    def test_sleep_data(self):
        """Test sleep data logging"""
        if not self.test_user_id:
            self.log_test("Sleep Data", False, "No test user ID available")
            return False
            
        try:
            sleep_data = {
                "user_id": self.test_user_id,
                "sleep_date": "2024-01-15",
                "bedtime": "2024-01-15T23:30:00",
                "wake_time": "2024-01-16T07:00:00",
                "sleep_duration": 7.5,
                "sleep_quality": 8,
                "bedtime_procrastination_minutes": 30,
                "sleep_environment_score": 7,
                "caffeine_intake": [{"time": "14:00", "amount": "1 cup", "type": "coffee"}]
            }
            
            response = requests.post(f"{self.base_url}/sleep/data", json=sleep_data, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                self.log_test("Sleep Data", True, "Sleep data logged successfully")
                return True
            else:
                self.log_test("Sleep Data", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Sleep Data", False, f"Exception: {str(e)}")
            return False
    
    def test_gamification_progress(self):
        """Test gamification progress retrieval"""
        if not self.test_user_id:
            self.log_test("Gamification Progress", False, "No test user ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/gamification/progress/{self.test_user_id}", timeout=10)
            
            if response.status_code == 200:
                progress = response.json()
                self.log_test("Gamification Progress", True, f"Progress retrieved: Level {progress.get('level', 'N/A')}")
                return True
            else:
                self.log_test("Gamification Progress", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Gamification Progress", False, f"Exception: {str(e)}")
            return False
    
    def test_dashboard_data(self):
        """Test dashboard data retrieval"""
        if not self.test_user_id:
            self.log_test("Dashboard Data", False, "No test user ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/dashboard/{self.test_user_id}", timeout=10)
            
            if response.status_code == 200:
                dashboard = response.json()
                self.log_test("Dashboard Data", True, f"Dashboard data retrieved with {len(dashboard)} sections")
                return True
            else:
                self.log_test("Dashboard Data", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Dashboard Data", False, f"Exception: {str(e)}")
            return False
    
    def test_ai_insights(self):
        """Test AI-powered insights generation"""
        if not self.test_user_id:
            self.log_test("AI Insights", False, "No test user ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/analytics/insights/{self.test_user_id}", timeout=30)
            
            if response.status_code == 200:
                insights = response.json()
                insights_text = insights.get("insights", "")
                if insights_text and "temporarily unavailable" not in insights_text.lower():
                    self.log_test("AI Insights", True, f"AI insights generated successfully (length: {len(insights_text)})")
                    return True
                else:
                    self.log_test("AI Insights", False, "AI insights returned but may be mocked or unavailable")
                    return False
            else:
                self.log_test("AI Insights", False, f"Failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("AI Insights", False, f"Exception: {str(e)}")
            return False
    
    def test_data_retrieval_endpoints(self):
        """Test various data retrieval endpoints"""
        if not self.test_user_id:
            self.log_test("Data Retrieval Endpoints", False, "No test user ID available")
            return False
        
        endpoints_to_test = [
            f"/cbt/thought-records/{self.test_user_id}",
            f"/pomodoro/sessions/{self.test_user_id}",
            f"/mindfulness/sessions/{self.test_user_id}",
            f"/intentions/{self.test_user_id}",
            f"/five-minute/sessions/{self.test_user_id}",
            f"/activity/sessions/{self.test_user_id}",
            f"/sleep/data/{self.test_user_id}",
            f"/gamification/achievements/{self.test_user_id}"
        ]
        
        successful_endpoints = 0
        total_endpoints = len(endpoints_to_test)
        
        for endpoint in endpoints_to_test:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    successful_endpoints += 1
            except:
                pass
        
        success_rate = successful_endpoints / total_endpoints
        if success_rate >= 0.8:
            self.log_test("Data Retrieval Endpoints", True, f"{successful_endpoints}/{total_endpoints} endpoints working")
            return True
        else:
            self.log_test("Data Retrieval Endpoints", False, f"Only {successful_endpoints}/{total_endpoints} endpoints working")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend Testing for Anti-Procrastination App")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Core functionality tests
        if not self.test_server_health():
            print("❌ Server not accessible. Stopping tests.")
            return self.generate_summary()
        
        self.test_user_creation()
        self.test_user_retrieval()
        
        # Module-specific tests
        self.test_cbt_thought_record()
        self.test_pomodoro_session()
        self.test_mindfulness_session()
        self.test_implementation_intention()
        self.test_five_minute_rule()
        self.test_physical_activity()
        self.test_sleep_data()
        
        # Advanced features
        self.test_gamification_progress()
        self.test_dashboard_data()
        self.test_ai_insights()
        self.test_data_retrieval_endpoints()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  - {result['test']}: {result['message']}")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests/total_tests)*100 if total_tests > 0 else 0,
            "test_results": self.test_results
        }

if __name__ == "__main__":
    tester = BackendTester()
    summary = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if summary["failed_tests"] == 0 else 1)