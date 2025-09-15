from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime, date
from enum import Enum
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME'].strip('"')]

# Create the main app without a prefix
app = FastAPI(title="Anti-Procrastination Productivity App", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# ===============================
# ENUMS AND BASE MODELS
# ===============================

class TaskDifficulty(str, Enum):
    VERY_EASY = "very_easy"
    EASY = "easy"
    MODERATE = "moderate"
    HARD = "hard"
    VERY_HARD = "very_hard"

class EmotionalState(str, Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    NEUTRAL = "neutral"
    HIGH = "high"
    VERY_HIGH = "very_high"

class TaskStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class ModuleType(str, Enum):
    CBT = "cbt"
    MINDFULNESS = "mindfulness"
    POMODORO = "pomodoro"
    IMPLEMENTATION_INTENTIONS = "implementation_intentions"
    FIVE_MINUTE_RULE = "five_minute_rule"
    ENVIRONMENTAL_DESIGN = "environmental_design"
    PHYSICAL_ACTIVITY = "physical_activity"
    SLEEP_CIRCADIAN = "sleep_circadian"
    SELF_COMPASSION = "self_compassion"
    ACCOUNTABILITY = "accountability"
    GAMIFICATION = "gamification"
    DATA_ANALYTICS = "data_analytics"

# ===============================
# USER MODELS
# ===============================

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    username: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    profile: Dict[str, Any] = Field(default_factory=dict)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    subscription_tier: str = "free"

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

# ===============================
# CBT MODULE MODELS
# ===============================

class ThoughtRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    trigger_situation: str
    automatic_thoughts: List[str]
    emotions: List[str]
    emotion_intensity: Dict[str, int]  # emotion -> intensity (1-10)
    physical_sensations: List[str]
    behaviors: List[str]
    evidence_for: List[str]
    evidence_against: List[str]
    balanced_thoughts: List[str]
    outcome_emotions: Dict[str, int]
    coping_strategies_used: List[str]
    effectiveness_rating: int  # 1-10

class BehavioralActivation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    task_name: str
    original_task: str
    sub_tasks: List[Dict[str, Any]]  # [{name, difficulty, completed, time_spent}]
    difficulty_prediction: int  # 1-10
    actual_difficulty: Optional[int] = None
    completion_status: TaskStatus
    rewards_earned: List[str]
    behavioral_experiments: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

# ===============================
# MINDFULNESS MODULE MODELS
# ===============================

class MeditationSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    meditation_type: str
    duration_planned: int  # minutes
    duration_actual: int  # minutes
    completion_rate: float  # 0-1
    pre_session_state: Dict[str, Any]
    post_session_state: Dict[str, Any]
    focus_quality: int  # 1-10
    insights: List[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MindfulnessCheckIn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    present_moment_awareness: int  # 1-10
    emotional_state: EmotionalState
    physical_tension_areas: List[str]
    thoughts_pattern: str
    mindful_action_taken: Optional[str] = None

# ===============================
# POMODORO MODULE MODELS
# ===============================

class PomodoroSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    task_name: str
    work_duration: int  # minutes
    break_duration: int  # minutes
    focus_quality_ratings: List[int]  # periodic ratings during session
    distractions: List[Dict[str, Any]]
    break_activities: List[str]
    completion_status: str
    productivity_score: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ===============================
# IMPLEMENTATION INTENTIONS MODELS
# ===============================

class ImplementationIntention(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    if_condition: str
    then_action: str
    context_triggers: List[str]
    success_count: int = 0
    total_opportunities: int = 0
    effectiveness_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None

# ===============================
# FIVE MINUTE RULE MODELS
# ===============================

class FiveMinuteSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    task_name: str
    micro_action_taken: str
    continued_beyond_five: bool
    total_duration: int  # minutes
    momentum_created: bool
    energy_before: int  # 1-10
    energy_after: int  # 1-10
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ===============================
# PHYSICAL ACTIVITY MODELS
# ===============================

class ActivitySession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    activity_type: str
    duration: int  # minutes
    intensity: int  # 1-10
    mood_before: int  # 1-10
    mood_after: int  # 1-10
    energy_before: int  # 1-10
    energy_after: int  # 1-10
    procrastination_level_before: int  # 1-10
    procrastination_level_after: int  # 1-10
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ===============================
# SLEEP MODULE MODELS
# ===============================

class SleepData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    sleep_date: date
    bedtime: datetime
    wake_time: datetime
    sleep_duration: float  # hours
    sleep_quality: int  # 1-10
    bedtime_procrastination_minutes: int
    next_day_procrastination_score: Optional[int] = None  # 1-10
    sleep_environment_score: int  # 1-10
    caffeine_intake: List[Dict[str, Any]]  # [{time, amount, type}]

# ===============================
# ACCOUNTABILITY MODELS
# ===============================

class AccountabilityPartner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    partner_id: str
    relationship_type: str  # peer, mentor, mentee
    goals_alignment: float  # 0-1
    communication_frequency: str
    check_in_schedule: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = True

class CheckInSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    partnership_id: str
    initiator_id: str
    scheduled_time: datetime
    actual_time: Optional[datetime] = None
    duration: Optional[int] = None  # minutes
    topics_discussed: List[str]
    progress_shared: Dict[str, Any]
    support_provided: List[str]
    next_steps: List[str]
    satisfaction_rating: Optional[int] = None  # 1-10
    completed: bool = False

# ===============================
# GAMIFICATION MODELS
# ===============================

class Achievement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    achievement_type: str
    title: str
    description: str
    points_earned: int
    unlock_date: datetime = Field(default_factory=datetime.utcnow)
    category: str
    rarity: str  # common, rare, epic, legendary

class UserProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    total_points: int = 0
    level: int = 1
    current_streak: int = 0
    longest_streak: int = 0
    modules_unlocked: List[str] = Field(default_factory=list)
    skill_levels: Dict[str, int] = Field(default_factory=dict)
    last_activity: datetime = Field(default_factory=datetime.utcnow)

# ===============================
# ANALYTICS MODELS
# ===============================

class BehaviorPattern(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    pattern_type: str
    pattern_data: Dict[str, Any]
    confidence_score: float  # 0-1
    identified_at: datetime = Field(default_factory=datetime.utcnow)
    interventions_suggested: List[str]
    effectiveness_data: Dict[str, Any] = Field(default_factory=dict)

class PersonalizedRecommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    recommendation_type: str
    content: str
    reasoning: str
    priority: int  # 1-10
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    viewed: bool = False
    acted_upon: bool = False
    effectiveness_feedback: Optional[int] = None  # 1-10

# ===============================
# API ROUTES
# ===============================

# AI Chat Helper
async def get_ai_insights(prompt: str, context: Dict[str, Any] = None) -> str:
    """Get AI insights using Emergent LLM integration"""
    try:
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=str(uuid.uuid4()),
            system_message="You are an expert behavioral psychologist and productivity coach specializing in evidence-based anti-procrastination interventions."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logging.error(f"AI insights error: {e}")
        return "AI insights temporarily unavailable"

# User Management
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    user_dict = user_data.dict()
    user_obj = User(
        email=user_dict["email"],
        username=user_dict["username"]
    )
    
    # Initialize user progress
    progress = UserProgress(user_id=user_obj.id)
    
    await db.users.insert_one(user_obj.dict())
    await db.user_progress.insert_one(progress.dict())
    
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# CBT Module Routes
@api_router.post("/cbt/thought-records", response_model=ThoughtRecord)
async def create_thought_record(thought_record: ThoughtRecord):
    """Create a new thought record"""
    await db.thought_records.insert_one(thought_record.dict())
    return thought_record

@api_router.get("/cbt/thought-records/{user_id}", response_model=List[ThoughtRecord])
async def get_thought_records(user_id: str, limit: int = 50):
    """Get thought records for a user"""
    records = await db.thought_records.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return [ThoughtRecord(**record) for record in records]

@api_router.post("/cbt/behavioral-activation", response_model=BehavioralActivation)
async def create_behavioral_activation(activation: BehavioralActivation):
    """Create a behavioral activation plan"""
    await db.behavioral_activations.insert_one(activation.dict())
    return activation

@api_router.get("/cbt/behavioral-activation/{user_id}", response_model=List[BehavioralActivation])
async def get_behavioral_activations(user_id: str):
    """Get behavioral activation plans for a user"""
    activations = await db.behavioral_activations.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(100)
    return [BehavioralActivation(**activation) for activation in activations]

# Mindfulness Module Routes
@api_router.post("/mindfulness/sessions", response_model=MeditationSession)
async def create_meditation_session(session: MeditationSession):
    """Log a meditation session"""
    await db.meditation_sessions.insert_one(session.dict())
    return session

@api_router.get("/mindfulness/sessions/{user_id}", response_model=List[MeditationSession])
async def get_meditation_sessions(user_id: str, limit: int = 50):
    """Get meditation sessions for a user"""
    sessions = await db.meditation_sessions.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return [MeditationSession(**session) for session in sessions]

@api_router.post("/mindfulness/check-ins", response_model=MindfulnessCheckIn)
async def create_mindfulness_checkin(checkin: MindfulnessCheckIn):
    """Create a mindfulness check-in"""
    await db.mindfulness_checkins.insert_one(checkin.dict())
    return checkin

# Pomodoro Module Routes
@api_router.post("/pomodoro/sessions", response_model=PomodoroSession)
async def create_pomodoro_session(session: PomodoroSession):
    """Log a Pomodoro session"""
    await db.pomodoro_sessions.insert_one(session.dict())
    return session

@api_router.get("/pomodoro/sessions/{user_id}", response_model=List[PomodoroSession])
async def get_pomodoro_sessions(user_id: str, limit: int = 50):
    """Get Pomodoro sessions for a user"""
    sessions = await db.pomodoro_sessions.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return [PomodoroSession(**session) for session in sessions]

# Implementation Intentions Routes
@api_router.post("/intentions", response_model=ImplementationIntention)
async def create_implementation_intention(intention: ImplementationIntention):
    """Create an implementation intention"""
    await db.implementation_intentions.insert_one(intention.dict())
    return intention

@api_router.get("/intentions/{user_id}", response_model=List[ImplementationIntention])
async def get_implementation_intentions(user_id: str):
    """Get implementation intentions for a user"""
    intentions = await db.implementation_intentions.find(
        {"user_id": user_id}
    ).sort("effectiveness_score", -1).to_list(100)
    return [ImplementationIntention(**intention) for intention in intentions]

@api_router.put("/intentions/{intention_id}/usage")
async def update_intention_usage(intention_id: str, success: bool):
    """Update usage statistics for an implementation intention"""
    update_data = {
        "$inc": {"total_opportunities": 1},
        "$set": {"last_used": datetime.utcnow()}
    }
    
    if success:
        update_data["$inc"]["success_count"] = 1
    
    await db.implementation_intentions.update_one(
        {"id": intention_id}, update_data
    )
    
    # Recalculate effectiveness score
    intention = await db.implementation_intentions.find_one({"id": intention_id})
    if intention and intention["total_opportunities"] > 0:
        effectiveness = intention["success_count"] / intention["total_opportunities"]
        await db.implementation_intentions.update_one(
            {"id": intention_id},
            {"$set": {"effectiveness_score": effectiveness}}
        )

# Five Minute Rule Routes
@api_router.post("/five-minute/sessions", response_model=FiveMinuteSession)
async def create_five_minute_session(session: FiveMinuteSession):
    """Log a five-minute rule session"""
    await db.five_minute_sessions.insert_one(session.dict())
    return session

@api_router.get("/five-minute/sessions/{user_id}", response_model=List[FiveMinuteSession])
async def get_five_minute_sessions(user_id: str, limit: int = 50):
    """Get five-minute rule sessions for a user"""
    sessions = await db.five_minute_sessions.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return [FiveMinuteSession(**session) for session in sessions]

# Physical Activity Routes
@api_router.post("/activity/sessions", response_model=ActivitySession)
async def create_activity_session(session: ActivitySession):
    """Log a physical activity session"""
    await db.activity_sessions.insert_one(session.dict())
    return session

@api_router.get("/activity/sessions/{user_id}", response_model=List[ActivitySession])
async def get_activity_sessions(user_id: str, limit: int = 50):
    """Get activity sessions for a user"""
    sessions = await db.activity_sessions.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return [ActivitySession(**session) for session in sessions]

# Sleep Module Routes
@api_router.post("/sleep/data", response_model=SleepData)
async def create_sleep_data(sleep_data: SleepData):
    """Log sleep data"""
    sleep_dict = sleep_data.dict()
    await db.sleep_data.insert_one(sleep_dict)
    return sleep_data

@api_router.get("/sleep/data/{user_id}", response_model=List[SleepData])
async def get_sleep_data(user_id: str, limit: int = 30):
    """Get sleep data for a user"""
    data = await db.sleep_data.find(
        {"user_id": user_id}
    ).sort("sleep_date", -1).limit(limit).to_list(limit)
    return [SleepData(**item) for item in data]

# Accountability Routes
@api_router.post("/accountability/partners", response_model=AccountabilityPartner)
async def create_accountability_partnership(partnership: AccountabilityPartner):
    """Create an accountability partnership"""
    await db.accountability_partners.insert_one(partnership.dict())
    return partnership

@api_router.get("/accountability/partners/{user_id}", response_model=List[AccountabilityPartner])
async def get_accountability_partners(user_id: str):
    """Get accountability partners for a user"""
    partners = await db.accountability_partners.find(
        {"$or": [{"user_id": user_id}, {"partner_id": user_id}], "active": True}
    ).to_list(100)
    return [AccountabilityPartner(**partner) for partner in partners]

@api_router.post("/accountability/check-ins", response_model=CheckInSession)
async def create_check_in_session(session: CheckInSession):
    """Create a check-in session"""
    await db.check_in_sessions.insert_one(session.dict())
    return session

# Gamification Routes
@api_router.post("/gamification/achievements", response_model=Achievement)
async def award_achievement(achievement: Achievement):
    """Award an achievement to a user"""
    await db.achievements.insert_one(achievement.dict())
    
    # Update user progress
    await db.user_progress.update_one(
        {"user_id": achievement.user_id},
        {"$inc": {"total_points": achievement.points_earned}}
    )
    
    return achievement

@api_router.get("/gamification/progress/{user_id}", response_model=UserProgress)
async def get_user_progress(user_id: str):
    """Get user progress and gamification data"""
    progress = await db.user_progress.find_one({"user_id": user_id})
    if not progress:
        # Create initial progress
        progress = UserProgress(user_id=user_id)
        await db.user_progress.insert_one(progress.dict())
    return UserProgress(**progress)

@api_router.get("/gamification/achievements/{user_id}", response_model=List[Achievement])
async def get_user_achievements(user_id: str):
    """Get user achievements"""
    achievements = await db.achievements.find(
        {"user_id": user_id}
    ).sort("unlock_date", -1).to_list(100)
    return [Achievement(**achievement) for achievement in achievements]

# Analytics Routes
@api_router.get("/analytics/insights/{user_id}")
async def get_personalized_insights(user_id: str):
    """Get AI-powered personalized insights for a user"""
    # Gather user data from various collections
    recent_sessions = await db.pomodoro_sessions.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(10).to_list(10)
    
    thought_records = await db.thought_records.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(5).to_list(5)
    
    sleep_data = await db.sleep_data.find(
        {"user_id": user_id}
    ).sort("sleep_date", -1).limit(7).to_list(7)
    
    # Create context for AI analysis
    context = {
        "recent_productivity_sessions": len(recent_sessions),
        "thought_patterns": len(thought_records),
        "sleep_quality_avg": sum([s.get("sleep_quality", 0) for s in sleep_data]) / len(sleep_data) if sleep_data else 0,
        "user_activity_level": "moderate"  # This would be calculated based on actual data
    }
    
    prompt = f"""
    Analyze this user's recent behavioral data and provide personalized insights:
    
    Context: {json.dumps(context, indent=2)}
    
    Please provide:
    1. Top 3 patterns you notice
    2. 2-3 specific actionable recommendations
    3. One encouraging observation about their progress
    
    Keep recommendations evidence-based and specific to anti-procrastination strategies.
    """
    
    insights = await get_ai_insights(prompt, context)
    
    return {"insights": insights, "context": context}

@api_router.post("/analytics/patterns", response_model=BehaviorPattern)
async def identify_behavior_pattern(pattern: BehaviorPattern):
    """Store an identified behavior pattern"""
    await db.behavior_patterns.insert_one(pattern.dict())
    return pattern

@api_router.post("/analytics/recommendations", response_model=PersonalizedRecommendation)
async def create_recommendation(recommendation: PersonalizedRecommendation):
    """Create a personalized recommendation"""
    await db.personalized_recommendations.insert_one(recommendation.dict())
    return recommendation

@api_router.get("/analytics/recommendations/{user_id}", response_model=List[PersonalizedRecommendation])
async def get_recommendations(user_id: str, viewed: bool = None):
    """Get personalized recommendations for a user"""
    query = {"user_id": user_id}
    if viewed is not None:
        query["viewed"] = viewed
    
    recommendations = await db.personalized_recommendations.find(
        query
    ).sort("priority", -1).limit(20).to_list(20)
    
    return [PersonalizedRecommendation(**rec) for rec in recommendations]

# Dashboard Data Route
@api_router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str):
    """Get comprehensive dashboard data for a user"""
    # Get latest data from each module
    progress = await db.user_progress.find_one({"user_id": user_id})
    
    recent_pomodoros = await db.pomodoro_sessions.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(5).to_list(5)
    
    recent_thought_records = await db.thought_records.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(3).to_list(3)
    
    active_intentions = await db.implementation_intentions.find(
        {"user_id": user_id}
    ).sort("effectiveness_score", -1).limit(5).to_list(5)
    
    recent_sleep = await db.sleep_data.find(
        {"user_id": user_id}
    ).sort("sleep_date", -1).limit(7).to_list(7)
    
    recent_achievements = await db.achievements.find(
        {"user_id": user_id}
    ).sort("unlock_date", -1).limit(3).to_list(3)
    
    return {
        "user_progress": progress,
        "recent_pomodoros": recent_pomodoros,
        "recent_thought_records": recent_thought_records,
        "active_intentions": active_intentions,
        "recent_sleep": recent_sleep,
        "recent_achievements": recent_achievements,
        "timestamp": datetime.utcnow()
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()