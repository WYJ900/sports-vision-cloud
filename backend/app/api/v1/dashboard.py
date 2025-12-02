from fastapi import APIRouter, Depends

from ...core.security import get_current_user
from ...services.user_service import UserService
from ...services.training_service import TrainingService
from ...services.device_service import DeviceService
from ...schemas.response import ResponseBase, DashboardStats

router = APIRouter(prefix="/dashboard", tags=["仪表盘"])


@router.get("/stats", response_model=ResponseBase[DashboardStats])
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """获取仪表盘统计数据"""
    total_users = await UserService.count_users()
    active_devices = await DeviceService.count_online_devices()
    today_sessions = await TrainingService.count_today_sessions()

    # 获取用户个人统计
    user_stats = await TrainingService.get_session_stats(current_user["sub"], days=30)

    stats = DashboardStats(
        total_users=total_users,
        active_devices=active_devices,
        today_sessions=today_sessions,
        avg_hit_rate=user_stats.get("avg_hit_rate", 0) or 0,
        avg_reaction_time=user_stats.get("avg_reaction_time", 0) or 0,
        total_training_hours=user_stats.get("total_duration", 0) / 3600
    )

    return ResponseBase(data=stats)


@router.get("/overview")
async def get_overview(current_user: dict = Depends(get_current_user)):
    """获取概览数据"""
    # 用户统计
    user_stats = await TrainingService.get_session_stats(current_user["sub"], days=7)

    # 趋势数据
    trends = await TrainingService.get_trend_data(current_user["sub"], days=7)

    # 设备状态
    devices = await DeviceService.get_user_devices(current_user["sub"])

    return ResponseBase(data={
        "stats": user_stats,
        "trends": trends,
        "devices": [d.model_dump() for d in devices]
    })
