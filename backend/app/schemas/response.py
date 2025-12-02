from pydantic import BaseModel
from typing import Any, Optional, Generic, TypeVar, List
from datetime import datetime

T = TypeVar("T")


class ResponseBase(BaseModel, Generic[T]):
    """统一响应格式"""
    code: int = 0
    message: str = "success"
    data: Optional[T] = None
    timestamp: datetime = None

    def __init__(self, **data):
        if "timestamp" not in data:
            data["timestamp"] = datetime.utcnow()
        super().__init__(**data)


class PagedResponse(BaseModel, Generic[T]):
    """分页响应"""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class DashboardStats(BaseModel):
    """仪表盘统计数据"""
    total_users: int = 0
    active_devices: int = 0
    today_sessions: int = 0
    avg_hit_rate: float = 0
    avg_reaction_time: float = 0
    total_training_hours: float = 0


class RealtimeMetrics(BaseModel):
    """实时指标"""
    current_pose_accuracy: float = 0
    current_fatigue_level: float = 0
    current_hit_rate: float = 0
    session_duration: int = 0
    calories_burned: float = 0
