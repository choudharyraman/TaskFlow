# DATABASE COLLECTION SCHEMAS

## Core Collections

### 1. Users Collection
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password_hash": "string",
  "created_at": "datetime",
  "last_active": "datetime",
  "user_progress": {
    "total_points": "int",
    "level": "int", 
    "current_streak": "int",
    "longest_streak": "int",
    "modules_unlocked": ["string"],
    "skill_levels": {
      "focus": "int",
      "emotional_regulation": "int",
      "mindfulness": "int",
      "task_management": "int",
      "self_compassion": "int",
      "habit_formation": "int"
    }
  },
  "preferences": {
    "notification_settings": "object",
    "theme": "string",
    "timezone": "string"
  }
}
```

### 2. CBT Thought Records Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "trigger_situation": "string",
  "automatic_thoughts": ["string"],
  "emotions": [
    {
      "emotion": "string",
      "intensity": "int (1-10)"
    }
  ],
  "physical_sensations": ["string"],
  "behavior": "string",
  "evidence_for": ["string"],
  "evidence_against": ["string"],
  "balanced_thought": "string",
  "outcome": {
    "emotions_after": ["object"],
    "effectiveness_rating": "int (1-10)",
    "likelihood_to_use_again": "int (1-10)"
  },
  "cognitive_distortions": ["string"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 3. Mindfulness Sessions Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "session_type": "string", // "breathing", "body_scan", "loving_kindness", "present_moment"
  "duration_minutes": "int",
  "pre_session_state": {
    "stress_level": "int (1-10)",
    "focus_level": "int (1-10)",
    "energy_level": "int (1-10)"
  },
  "post_session_state": {
    "stress_level": "int (1-10)",
    "focus_level": "int (1-10)",
    "energy_level": "int (1-10)"
  },
  "session_quality": {
    "focus_rating": "int (1-10)",
    "calmness_rating": "int (1-10)",
    "overall_satisfaction": "int (1-10)"
  },
  "interruptions": "int",
  "notes": "string",
  "created_at": "datetime"
}
```

### 4. Pomodoro Sessions Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "session_config": {
    "work_duration": "int",
    "break_duration": "int",
    "long_break_duration": "int",
    "cycles_planned": "int"
  },
  "session_results": {
    "cycles_completed": "int",
    "total_focus_time": "int",
    "total_break_time": "int",
    "completion_rate": "float"
  },
  "distractions": [
    {
      "timestamp": "datetime",
      "type": "string",
      "description": "string"
    }
  ],
  "focus_ratings": [
    {
      "cycle": "int",
      "rating": "int (1-10)"
    }
  ],
  "productivity_rating": "int (1-10)",
  "task_completed": "boolean",
  "created_at": "datetime"
}
```

### 5. Five-Minute Rule Sessions Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "task_category": "string",
  "task_description": "string",
  "initial_energy_level": "int (1-10)",
  "initial_motivation": "int (1-10)",
  "session_outcome": {
    "continued_working": "boolean",
    "total_time_worked": "int",
    "final_energy_level": "int (1-10)",
    "task_progress": "int (0-100)"
  },
  "momentum_score": "int (1-10)",
  "insights": "string",
  "created_at": "datetime"
}
```

### 6. Physical Activity Sessions Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "activity_type": "string", // "walking", "stretching", "cardio", "yoga", "strength", "dance"
  "duration_minutes": "int",
  "intensity_level": "int (1-10)",
  "pre_activity_state": {
    "mood": "int (1-10)",
    "energy": "int (1-10)",
    "procrastination_level": "int (1-10)"
  },
  "post_activity_state": {
    "mood": "int (1-10)",
    "energy": "int (1-10)",
    "procrastination_level": "int (1-10)"
  },
  "location": "string",
  "equipment_used": ["string"],
  "notes": "string",
  "created_at": "datetime"
}
```

### 7. Sleep Data Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "sleep_date": "date",
  "bedtime": "datetime",
  "intended_bedtime": "datetime",
  "wake_time": "datetime",
  "sleep_quality": "int (1-10)",
  "sleep_duration_hours": "float",
  "bedtime_procrastination_minutes": "int",
  "sleep_environment": {
    "room_temperature": "int",
    "lighting_quality": "int (1-10)",
    "noise_level": "int (1-10)",
    "device_usage_before_bed": "boolean"
  },
  "caffeine_intake": [
    {
      "time": "datetime",
      "amount_mg": "int",
      "source": "string"
    }
  ],
  "morning_alertness": "int (1-10)",
  "created_at": "datetime"
}
```

### 8. Social & Accountability Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "partner_id": "ObjectId",
  "partnership_type": "string", // "accountability", "study_buddy", "workout_partner"
  "goals_shared": ["string"],
  "check_in_frequency": "string",
  "last_check_in": "datetime",
  "check_ins": [
    {
      "date": "datetime",
      "user_report": "string",
      "partner_feedback": "string",
      "goal_progress": "int (0-100)",
      "support_rating": "int (1-10)"
    }
  ],
  "partnership_effectiveness": "int (1-10)",
  "created_at": "datetime"
}
```

### 9. Environmental Settings Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "physical_environment": {
    "workspace_organization": "int (1-10)",
    "lighting_quality": "int (1-10)",
    "noise_level": "int (1-10)",
    "temperature_comfort": "int (1-10)",
    "phone_placement": "string"
  },
  "digital_environment": {
    "app_blocking_enabled": "boolean",
    "blocked_apps": ["string"],
    "blocked_websites": ["string"],
    "focus_mode_duration": "int",
    "notification_settings": "object"
  },
  "optimization_tips_tried": ["string"],
  "effectiveness_ratings": "object",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 10. Gamification Achievements Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "achievement_id": "string",
  "title": "string",
  "description": "string",
  "category": "string", // "productivity", "mindfulness", "consistency", "growth", "social", "milestone"
  "rarity": "string", // "common", "rare", "epic", "legendary"  
  "points_earned": "int",
  "unlock_date": "datetime",
  "progress_toward_next": "object"
}
```

### 11. Implementation Intentions Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "if_situation": "string",
  "then_action": "string",
  "category": "string", // "task_initiation", "distraction_management", "emotional_regulation", "routine_building"
  "context_triggers": ["string"],
  "usage_tracking": [
    {
      "date": "datetime",
      "triggered": "boolean",
      "action_taken": "boolean",
      "effectiveness": "int (1-10)"
    }
  ],
  "overall_effectiveness": "float",
  "created_at": "datetime"
}
```

### 12. Third-Party Integrations Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "integration_type": "string", // "google-calendar", "apple-health", "notion", "spotify", etc.
  "connection_status": "string", // "connected", "disconnected", "error"
  "authentication_data": "object", // encrypted
  "sync_settings": {
    "auto_sync": "boolean",
    "sync_frequency": "string",
    "data_types": ["string"]
  },
  "last_sync": "datetime",
  "sync_history": [
    {
      "timestamp": "datetime",
      "status": "string",
      "records_synced": "int",
      "errors": ["string"]
    }
  ]
}
```

### 13. Research Participation Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "study_id": "string",
  "participation_status": "string", // "enrolled", "active", "completed", "withdrawn"
  "consent_given": "boolean",
  "consent_date": "datetime",
  "study_data": {
    "baseline_measurements": "object",
    "outcome_measurements": [
      {
        "measurement_type": "string",
        "date": "datetime",
        "responses": "object",
        "scores": "object"
      }
    ]
  },
  "anonymized_data_sharing": "boolean"
}
```

### 14. Analytics & Insights Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "insight_type": "string", // "behavioral_pattern", "correlation", "recommendation"
  "insight_data": {
    "title": "string",
    "description": "string",
    "data_sources": ["string"],
    "confidence_score": "float",
    "actionable_recommendations": ["string"]
  },
  "ai_analysis": "string",
  "user_feedback": {
    "helpful": "boolean",
    "implemented": "boolean",
    "effectiveness": "int (1-10)"
  },
  "generated_at": "datetime"
}
```

### 15. Self-Compassion Exercises Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "exercise_type": "string", // "self_kindness", "loving_kindness", "forgiveness", "acceptance"
  "duration_minutes": "int",
  "pre_exercise_state": {
    "self_criticism_level": "int (1-10)",
    "mood": "int (1-10)",
    "stress_level": "int (1-10)"
  },
  "post_exercise_state": {
    "self_criticism_level": "int (1-10)",
    "mood": "int (1-10)",
    "stress_level": "int (1-10)"
  },
  "compassion_phrases_used": ["string"],
  "insights": "string",
  "effectiveness_rating": "int (1-10)",
  "created_at": "datetime"
}
```

## Indexes and Performance Optimization

### Primary Indexes
- All collections: `user_id` (for user-specific queries)
- All collections: `created_at` (for temporal queries)
- Users: `email` (unique, for authentication)
- CBTRecords: `trigger_situation` (for pattern analysis)
- PomodoroSessions: `productivity_rating` (for effectiveness analysis)
- SleepData: `sleep_date` (for daily tracking)

### Compound Indexes
- `{user_id: 1, created_at: -1}` (for user timeline queries)
- `{user_id: 1, session_type: 1}` (for mindfulness session filtering)
- `{user_id: 1, activity_type: 1}` (for activity analysis)
- `{user_id: 1, sleep_date: -1}` (for recent sleep data)

### Text Indexes  
- CBTRecords: `automatic_thoughts`, `balanced_thought`
- Analytics: `ai_analysis`, `insight_data.description`
- Users: `username`, `email`