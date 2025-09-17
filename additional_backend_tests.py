#!/usr/bin/env python3
"""
Additional Backend Tests for New Module Features
Tests cross-module functionality and advanced features
"""

import requests
import json
import uuid
from datetime import datetime, date
import time

# Backend URL from environment
BACKEND_URL = "https://focusflow-53.preview.emergentagent.com/api"

class AdditionalBackendTester:
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
    
    def setup_test_user(self):
        """Create a test user for advanced testing"""
        try:
            user_data = {
                "email": "advanced.tester@productivity.com",
                "username": "advancedtester",
                "password": "securepassword123"
            }
            
            response = requests.post(f"{self.base_url}/users", json=user_data, timeout=10)
            
            if response.status_code in [200, 201]:
                user = response.json()
                self.test_user_id = user.get("id")
                self.log_test("Advanced Test User Setup", True, f"User created with ID: {self.test_user_id}")
                return True
            else:
                self.log_test("Advanced Test User Setup", False, f"Failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Advanced Test User Setup", False, f"Exception: {str(e)}")
            return False
    
    def test_cross_module_data_correlation(self):
        """Test that data from different modules can be correlated"""
        if not self.test_user_id:
            self.log_test("Cross-Module Data Correlation", False, "No test user ID available")
            return False
        
        try:
            # Create data in multiple modules
            modules_data = []
            
            # 1. Create CBT thought record
            cbt_data = {
                "user_id": self.test_user_id,
                "trigger_situation": "Feeling overwhelmed by multiple tasks",
                "automatic_thoughts": ["I can't handle this workload"],
                "emotions": ["anxiety", "stress"],
                "emotion_intensity": {"anxiety": 7, "stress": 8},
                "physical_sensations": ["tight chest"],
                "behaviors": ["procrastination"],
                "evidence_for": ["Many tasks pending"],
                "evidence_against": ["I've handled similar loads before"],
                "balanced_thoughts": ["I can prioritize and tackle one task at a time"],
                "outcome_emotions": {"anxiety": 4, "stress": 5},
                "coping_strategies_used": ["deep breathing", "task prioritization"],
                "effectiveness_rating": 8
            }
            
            cbt_response = requests.post(f"{self.base_url}/cbt/thought-records", json=cbt_data, timeout=10)
            if cbt_response.status_code in [200, 201]:
                modules_data.append("CBT")
            
            # 2. Create Pomodoro session
            pomodoro_data = {
                "user_id": self.test_user_id,
                "task_name": "Priority task from CBT session",
                "work_duration": 25,
                "break_duration": 5,
                "focus_quality_ratings": [8, 9, 8, 9],
                "distractions": [{"type": "internal_worry", "duration": 1}],
                "break_activities": ["deep breathing"],
                "completion_status": "completed",
                "productivity_score": 8.5
            }
            
            pomodoro_response = requests.post(f"{self.base_url}/pomodoro/sessions", json=pomodoro_data, timeout=10)
            if pomodoro_response.status_code in [200, 201]:
                modules_data.append("Pomodoro")
            
            # 3. Create sleep data
            sleep_data = {
                "user_id": self.test_user_id,
                "sleep_date": "2024-01-20",
                "bedtime": "2024-01-20T23:00:00",
                "wake_time": "2024-01-21T07:00:00",
                "sleep_duration": 8.0,
                "sleep_quality": 7,
                "bedtime_procrastination_minutes": 15,
                "next_day_procrastination_score": 4,
                "sleep_environment_score": 8,
                "caffeine_intake": []
            }
            
            sleep_response = requests.post(f"{self.base_url}/sleep/data", json=sleep_data, timeout=10)
            if sleep_response.status_code in [200, 201]:
                modules_data.append("Sleep")
            
            # 4. Test dashboard correlation
            dashboard_response = requests.get(f"{self.base_url}/dashboard/{self.test_user_id}", timeout=10)
            
            if dashboard_response.status_code == 200:
                dashboard_data = dashboard_response.json()
                
                # Check if dashboard contains data from multiple modules
                has_cbt = len(dashboard_data.get("recent_thought_records", [])) > 0
                has_pomodoro = len(dashboard_data.get("recent_pomodoros", [])) > 0
                has_sleep = len(dashboard_data.get("recent_sleep", [])) > 0
                
                correlation_score = sum([has_cbt, has_pomodoro, has_sleep])
                
                if correlation_score >= 2:
                    self.log_test("Cross-Module Data Correlation", True, 
                                f"Dashboard successfully correlates data from {correlation_score} modules: {modules_data}")
                    return True
                else:
                    self.log_test("Cross-Module Data Correlation", False, 
                                f"Dashboard only shows data from {correlation_score} modules")
                    return False
            else:
                self.log_test("Cross-Module Data Correlation", False, 
                            f"Dashboard request failed with status {dashboard_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Cross-Module Data Correlation", False, f"Exception: {str(e)}")
            return False
    
    def test_ai_behavioral_analysis_depth(self):
        """Test that AI insights provide comprehensive behavioral analysis"""
        if not self.test_user_id:
            self.log_test("AI Behavioral Analysis Depth", False, "No test user ID available")
            return False
        
        try:
            response = requests.get(f"{self.base_url}/analytics/insights/{self.test_user_id}", timeout=30)
            
            if response.status_code == 200:
                insights_data = response.json()
                insights_text = insights_data.get("insights", "")
                context = insights_data.get("context", {})
                
                # Check for comprehensive analysis
                analysis_indicators = [
                    "pattern" in insights_text.lower(),
                    "recommendation" in insights_text.lower(),
                    "behavior" in insights_text.lower(),
                    "productivity" in insights_text.lower(),
                    len(insights_text) >= 2000,  # User specified 2000+ characters
                    context.get("recent_productivity_sessions", 0) >= 0,
                    "sleep_quality_avg" in context
                ]
                
                depth_score = sum(analysis_indicators)
                
                if depth_score >= 5 and len(insights_text) >= 2000:
                    self.log_test("AI Behavioral Analysis Depth", True, 
                                f"AI generated comprehensive {len(insights_text)}-character analysis with {depth_score}/7 depth indicators")
                    return True
                else:
                    self.log_test("AI Behavioral Analysis Depth", False, 
                                f"AI analysis insufficient: {len(insights_text)} chars, {depth_score}/7 indicators")
                    return False
            else:
                self.log_test("AI Behavioral Analysis Depth", False, 
                            f"AI insights request failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("AI Behavioral Analysis Depth", False, f"Exception: {str(e)}")
            return False
    
    def test_gamification_achievement_system(self):
        """Test advanced gamification features"""
        if not self.test_user_id:
            self.log_test("Gamification Achievement System", False, "No test user ID available")
            return False
        
        try:
            # Test achievement creation
            achievement_data = {
                "user_id": self.test_user_id,
                "achievement_type": "productivity_milestone",
                "title": "Focus Master",
                "description": "Completed 10 high-quality Pomodoro sessions",
                "points_earned": 250,
                "category": "productivity",
                "rarity": "epic"
            }
            
            achievement_response = requests.post(f"{self.base_url}/gamification/achievements", 
                                               json=achievement_data, timeout=10)
            
            if achievement_response.status_code in [200, 201]:
                # Test progress update
                progress_response = requests.get(f"{self.base_url}/gamification/progress/{self.test_user_id}", 
                                               timeout=10)
                
                if progress_response.status_code == 200:
                    progress_data = progress_response.json()
                    
                    # Check if points were added
                    total_points = progress_data.get("total_points", 0)
                    
                    # Test achievements retrieval
                    achievements_response = requests.get(f"{self.base_url}/gamification/achievements/{self.test_user_id}", 
                                                       timeout=10)
                    
                    if achievements_response.status_code == 200:
                        achievements = achievements_response.json()
                        
                        if len(achievements) > 0 and total_points >= 250:
                            self.log_test("Gamification Achievement System", True, 
                                        f"Achievement system working: {len(achievements)} achievements, {total_points} points")
                            return True
                        else:
                            self.log_test("Gamification Achievement System", False, 
                                        f"Achievement system incomplete: {len(achievements)} achievements, {total_points} points")
                            return False
                    else:
                        self.log_test("Gamification Achievement System", False, 
                                    f"Achievements retrieval failed with status {achievements_response.status_code}")
                        return False
                else:
                    self.log_test("Gamification Achievement System", False, 
                                f"Progress retrieval failed with status {progress_response.status_code}")
                    return False
            else:
                self.log_test("Gamification Achievement System", False, 
                            f"Achievement creation failed with status {achievement_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Gamification Achievement System", False, f"Exception: {str(e)}")
            return False
    
    def test_data_persistence_integrity(self):
        """Test that data persists correctly across requests"""
        if not self.test_user_id:
            self.log_test("Data Persistence Integrity", False, "No test user ID available")
            return False
        
        try:
            # Create multiple data points
            data_points_created = 0
            
            # Create implementation intention
            intention_data = {
                "user_id": self.test_user_id,
                "if_condition": "When I feel overwhelmed by my task list",
                "then_action": "I will take 3 deep breaths and choose the most important task",
                "context_triggers": ["task_overload", "anxiety", "decision_paralysis"]
            }
            
            intention_response = requests.post(f"{self.base_url}/intentions", json=intention_data, timeout=10)
            if intention_response.status_code in [200, 201]:
                data_points_created += 1
            
            # Create mindfulness session
            mindfulness_data = {
                "user_id": self.test_user_id,
                "meditation_type": "body_scan",
                "duration_planned": 15,
                "duration_actual": 12,
                "completion_rate": 0.8,
                "pre_session_state": {"stress": 8, "focus": 3},
                "post_session_state": {"stress": 4, "focus": 7},
                "focus_quality": 8,
                "insights": ["Noticed tension in shoulders", "Mind became calmer"]
            }
            
            mindfulness_response = requests.post(f"{self.base_url}/mindfulness/sessions", 
                                               json=mindfulness_data, timeout=10)
            if mindfulness_response.status_code in [200, 201]:
                data_points_created += 1
            
            # Wait a moment for data to persist
            time.sleep(1)
            
            # Retrieve data to verify persistence
            intentions_response = requests.get(f"{self.base_url}/intentions/{self.test_user_id}", timeout=10)
            mindfulness_response = requests.get(f"{self.base_url}/mindfulness/sessions/{self.test_user_id}", timeout=10)
            
            data_points_retrieved = 0
            
            if intentions_response.status_code == 200:
                intentions = intentions_response.json()
                if len(intentions) > 0:
                    data_points_retrieved += 1
            
            if mindfulness_response.status_code == 200:
                sessions = mindfulness_response.json()
                if len(sessions) > 0:
                    data_points_retrieved += 1
            
            if data_points_created == data_points_retrieved and data_points_created >= 2:
                self.log_test("Data Persistence Integrity", True, 
                            f"All {data_points_created} data points persisted and retrieved successfully")
                return True
            else:
                self.log_test("Data Persistence Integrity", False, 
                            f"Data persistence issue: created {data_points_created}, retrieved {data_points_retrieved}")
                return False
                
        except Exception as e:
            self.log_test("Data Persistence Integrity", False, f"Exception: {str(e)}")
            return False
    
    def run_additional_tests(self):
        """Run all additional backend tests"""
        print("🔬 Starting Additional Backend Testing for New Module Features")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        if not self.setup_test_user():
            print("❌ Cannot proceed without test user. Stopping additional tests.")
            return self.generate_summary()
        
        # Run advanced tests
        self.test_cross_module_data_correlation()
        self.test_ai_behavioral_analysis_depth()
        self.test_gamification_achievement_system()
        self.test_data_persistence_integrity()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 80)
        print("📊 ADDITIONAL TESTS SUMMARY")
        print("=" * 80)
        print(f"Total Additional Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "No tests run")
        
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
    tester = AdditionalBackendTester()
    summary = tester.run_additional_tests()