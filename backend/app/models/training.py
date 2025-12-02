from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TrainingStatus(str, Enum):
    """训练状态"""
    IDLE = "idle"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class PoseKeypoint(BaseModel):
    """姿态关键点"""
    x: float
    y: float
    z: float
    visibility: float = 1.0


class PoseData(BaseModel):
    """姿态数据 - MediaPipe 33关键点"""
    timestamp: datetime
    device_id: str
    user_id: str
    keypoints: List[PoseKeypoint] = Field(..., min_length=33, max_length=33)
    confidence: float = Field(ge=0, le=1)


class TrainingMetrics(BaseModel):
    """训练指标"""
    hit_rate: float = Field(ge=0, le=100, description="击球回传率%")
    reaction_time: float = Field(ge=0, description="平均反应时间(ms)")
    accuracy: float = Field(ge=0, le=100, description="姿态准确率%")
    fatigue_level: float = Field(ge=0, le=100, description="疲劳度%")
    calories_burned: float = Field(ge=0, description="消耗卡路里")
    total_hits: int = Field(ge=0, description="总击球数")
    successful_hits: int = Field(ge=0, description="成功击球数")


class TrainingSession(BaseModel):
    """训练会话"""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    device_id: str
    status: TrainingStatus = TrainingStatus.IDLE
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    duration_seconds: int = 0
    metrics: Optional[TrainingMetrics] = None
    difficulty_level: int = Field(default=1, ge=1, le=10)
    training_mode: str = "standard"

    class Config:
        populate_by_name = True


class TrainingPlan(BaseModel):
    """个性化训练计划"""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    name: str
    description: Optional[str] = None
    target_metrics: TrainingMetrics
    weekly_sessions: int = 3
    session_duration_minutes: int = 30
    focus_areas: List[str] = []
    ai_recommendations: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class AIAnalysis(BaseModel):
    """AI分析结果"""
    user_id: str
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    weaknesses: List[str] = []
    strengths: List[str] = []
    improvement_suggestions: List[str] = []
    predicted_progress: float = 0
    risk_alerts: List[str] = []
