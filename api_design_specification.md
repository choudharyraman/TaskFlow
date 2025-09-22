# API DESIGN SPECIFICATION

## API Architecture Overview

### Base URL Structure
- **Production**: `https://api.focusfirst.com`
- **Development**: `https://focusfirst.preview.emergentagent.com/api`
- **Local**: `http://localhost:8001/api`

### API Versioning
- Current Version: `v1` (implicit in current endpoints)
- Future: `/api/v2/...` for breaking changes

## Core API Endpoints

### 1. User Management APIs

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response: 201 Created
{
  "user_id": "string",
  "username": "string",
  "email": "string",
  "created_at": "datetime",
  "user_progress": {
    "total_points": 0,
    "level": 1,
    "current_streak": 0
  }
}
```

#### Get User Profile
```http
GET /api/users/{user_id}
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "user_id": "string",
  "username": "string",
  "email": "string",
  "user_progress": {
    "total_points": "int",
    "level": "int",
    "current_streak": "int",
    "longest_streak": "int",
    "modules_unlocked": ["string"],
    "skill_levels": "object"
  },
  "preferences": "object"
}
```

### 2. Dashboard API

#### Get Dashboard Data
```http
GET /api/dashboard/{user_id}
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "user_progress": {
    "total_points": "int",
    "level": "int", 
    "current_streak": "int"
  },
  "recent_activities": [
    {
      "module": "string",
      "title": "string",
      "timestamp": "datetime",
      "points": "int"
    }
  ],
  "ai_insights": "string",
  "quick_stats": {
    "sessions_this_week": "int",
    "productivity_score": "float",
    "top_performing_module": "string"
  }
}
```

### 3. CBT Tools APIs

#### Create Thought Record
```http
POST /api/cbt/thought-records
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "user_id": "string",
  "trigger_situation": "string",
  "automatic_thoughts": ["string"],
  "emotions": [
    {
      "emotion": "string",
      "intensity": "int"
    }
  ],
  "physical_sensations": ["string"],
  "behavior": "string",
  "evidence_for": ["string"],
  "evidence_against": ["string"],
  "balanced_thought": "string",
  "cognitive_distortions": ["string"]
}

Response: 201 Created
{
  "thought_record_id": "string",
  "created_at": "datetime",
  "points_earned": "int"
}
```

#### Get Thought Records
```http
GET /api/cbt/thought-records/{user_id}?limit=10&offset=0
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "thought_records": [
    {
      "thought_record_id": "string",
      "trigger_situation": "string",
      "emotions": ["object"],
      "balanced_thought": "string",
      "effectiveness_rating": "int",
      "created_at": "datetime"
    }
  ],
  "total_count": "int",
  "pagination": {
    "limit": "int",
    "offset": "int",
    "has_more": "boolean"
  }
}
```

### 4. Mindfulness APIs

#### Create Mindfulness Session
```http
POST /api/mindfulness/sessions
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "user_id": "string",
  "session_type": "string",
  "duration_minutes": "int",
  "pre_session_state": {
    "stress_level": "int",
    "focus_level": "int",
    "energy_level": "int"
  },
  "post_session_state": {
    "stress_level": "int",
    "focus_level": "int", 
    "energy_level": "int"
  },
  "session_quality": {
    "focus_rating": "int",
    "calmness_rating": "int",
    "overall_satisfaction": "int"
  }
}

Response: 201 Created
{
  "session_id": "string",
  "points_earned": "int",
  "improvement_metrics": {
    "stress_reduction": "int",
    "focus_improvement": "int",
    "energy_change": "int"
  }
}
```

#### Get Mindfulness Analytics
```http
GET /api/mindfulness/analytics/{user_id}?period=30d
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "total_sessions": "int",
  "total_minutes": "int",
  "average_session_quality": "float",
  "session_distribution": {
    "breathing": "int",
    "body_scan": "int",
    "loving_kindness": "int",
    "present_moment": "int"
  },
  "progress_trends": {
    "stress_reduction_trend": "float",
    "focus_improvement_trend": "float",
    "consistency_score": "float"
  }
}
```

### 5. Pomodoro Timer APIs

#### Start Pomodoro Session
```http
POST /api/pomodoro/sessions
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "user_id": "string",
  "session_config": {
    "work_duration": "int",
    "break_duration": "int",
    "long_break_duration": "int",
    "cycles_planned": "int"
  },
  "task_description": "string"
}

Response: 201 Created
{
  "session_id": "string",
  "start_time": "datetime",
  "expected_end_time": "datetime"
}
```

#### Complete Pomodoro Session
```http
PUT /api/pomodoro/sessions/{session_id}/complete
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "cycles_completed": "int",
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
      "rating": "int"
    }
  ],
  "productivity_rating": "int",
  "task_completed": "boolean"
}

Response: 200 OK
{
  "points_earned": "int",
  "productivity_score": "float",
  "focus_analysis": {
    "average_focus": "float",
    "distraction_frequency": "float",
    "completion_rate": "float"
  }
}
```

### 6. Five-Minute Rule APIs

#### Start Five-Minute Session
```http
POST /api/five-minute/sessions
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "user_id": "string",
  "task_category": "string",
  "task_description": "string",
  "initial_energy_level": "int",
  "initial_motivation": "int"
}

Response: 201 Created
{
  "session_id": "string",
  "start_time": "datetime",
  "suggested_actions": ["string"]
}
```

#### Complete Five-Minute Session  
```http
PUT /api/five-minute/sessions/{session_id}/complete
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "continued_working": "boolean",
  "total_time_worked": "int",
  "final_energy_level": "int",
  "task_progress": "int",
  "momentum_score": "int"
}

Response: 200 OK
{
  "points_earned": "int",
  "momentum_analysis": {
    "continuation_rate": "float",
    "energy_change": "int",
    "effectiveness_score": "float"
  }
}
```

### 7. Physical Activity APIs

#### Log Activity Session
```http
POST /api/activity/sessions
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "user_id": "string",
  "activity_type": "string",
  "duration_minutes": "int", 
  "intensity_level": "int",
  "pre_activity_state": {
    "mood": "int",
    "energy": "int",
    "procrastination_level": "int"
  },
  "post_activity_state": {
    "mood": "int",
    "energy": "int",
    "procrastination_level": "int"
  },
  "location": "string",
  "equipment_used": ["string"]
}

Response: 201 Created
{
  "session_id": "string",
  "points_earned": "int",
  "impact_analysis": {
    "mood_improvement": "int",
    "energy_boost": "int", 
    "procrastination_reduction": "int"
  }
}
```

### 8. Sleep Tracking APIs

#### Log Sleep Data
```http
POST /api/sleep/data
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "user_id": "string",
  "sleep_date": "date",
  "bedtime": "datetime",
  "intended_bedtime": "datetime",
  "wake_time": "datetime",
  "sleep_quality": "int",
  "bedtime_procrastination_minutes": "int",
  "sleep_environment": {
    "room_temperature": "int",
    "lighting_quality": "int",
    "noise_level": "int",
    "device_usage_before_bed": "boolean"
  },
  "caffeine_intake": [
    {
      "time": "datetime",
      "amount_mg": "int",
      "source": "string"
    }
  ]
}

Response: 201 Created
{
  "sleep_entry_id": "string",
  "sleep_score": "float",
  "recommendations": ["string"]
}
```

### 9. AI Analytics APIs

#### Get Behavioral Insights
```http
GET /api/analytics/insights/{user_id}
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "generated_at": "datetime",
  "insights": {
    "behavioral_patterns": [
      {
        "pattern": "string",
        "confidence": "float",
        "description": "string",
        "data_sources": ["string"]
      }
    ],
    "correlations": [
      {
        "factor1": "string",
        "factor2": "string", 
        "correlation_strength": "float",
        "description": "string"
      }
    ],
    "recommendations": [
      {
        "priority": "string",
        "title": "string",
        "description": "string",
        "expected_impact": "string"
      }
    ]
  },
  "ai_narrative": "string"
}
```

### 10. Gamification APIs

#### Get User Achievements
```http
GET /api/gamification/achievements/{user_id}
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "achievements": [
    {
      "achievement_id": "string",
      "title": "string",
      "description": "string", 
      "category": "string",
      "rarity": "string",
      "points_earned": "int",
      "unlock_date": "datetime"
    }
  ],
  "total_achievements": "int",
  "achievements_by_category": "object"
}
```

#### Get User Progress
```http
GET /api/gamification/progress/{user_id}
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "total_points": "int",
  "level": "int",
  "current_streak": "int",
  "longest_streak": "int",
  "skill_levels": {
    "focus": "int",
    "emotional_regulation": "int",
    "mindfulness": "int",
    "task_management": "int",
    "self_compassion": "int",
    "habit_formation": "int"
  },
  "progress_to_next_level": "float",
  "recent_achievements": ["object"]
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object",
    "timestamp": "datetime",
    "request_id": "string"
  }
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT requests
- `201 Created` - Successful POST requests  
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limiting
- `500 Internal Server Error` - Server errors

### Rate Limiting
- **General APIs**: 100 requests/minute per user
- **AI Analytics**: 10 requests/minute per user  
- **File Uploads**: 20 requests/minute per user
- **Authentication**: 5 requests/minute per IP

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_id",
  "exp": "timestamp",
  "iat": "timestamp", 
  "scope": ["read", "write"],
  "user_level": "int"
}
```

### API Security Headers
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-API-Version: v1
X-Request-ID: {uuid}
```