from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ...core.security import get_current_user
from ...services.training_service import TrainingService
from ...models.training import TrainingSession, TrainingMetrics, PoseData, AIAnalysis
from ...schemas.response import ResponseBase

router = APIRouter(prefix="/training", tags=["训练"])


class StartSessionRequest:
    def __init__(self, device_id: str, mode: str = "standard"):
        self.device_id = device_id
        self.mode = mode


@router.post("/sessions/start", response_model=ResponseBase[TrainingSession])
async def start_training_session(
    device_id: str,
    mode: str = "standard",
    current_user: dict = Depends(get_current_user)
):
    """开始训练会话"""
    session = await TrainingService.start_session(
        user_id=current_user["sub"],
        device_id=device_id,
        mode=mode
    )
    return ResponseBase(data=session, message="训练已开始")


@router.post("/sessions/{session_id}/end", response_model=ResponseBase[TrainingSession])
async def end_training_session(
    session_id: str,
    metrics: TrainingMetrics,
    current_user: dict = Depends(get_current_user)
):
    """结束训练会话"""
    try:
        session = await TrainingService.end_session(session_id, metrics)
        return ResponseBase(data=session, message="训练已结束")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/pose", status_code=status.HTTP_201_CREATED)
async def upload_pose_data(pose_data: PoseData):
    """上传姿态数据"""
    await TrainingService.save_pose_data(pose_data)
    return {"message": "姿态数据已保存"}


@router.post("/metrics")
async def upload_realtime_metrics(
    session_id: str,
    metrics: dict,
    current_user: dict = Depends(get_current_user)
):
    """上传实时指标"""
    await TrainingService.save_realtime_metrics(
        user_id=current_user["sub"],
        session_id=session_id,
        metrics=metrics
    )
    return {"message": "指标已保存"}


@router.get("/sessions", response_model=ResponseBase[List[TrainingSession]])
async def get_training_sessions(
    days: int = 30,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """获取训练历史"""
    sessions = await TrainingService.get_user_sessions(
        user_id=current_user["sub"],
        days=days,
        limit=limit
    )
    return ResponseBase(data=sessions)


@router.get("/stats", response_model=ResponseBase[dict])
async def get_training_stats(
    days: int = 7,
    current_user: dict = Depends(get_current_user)
):
    """获取训练统计"""
    stats = await TrainingService.get_session_stats(
        user_id=current_user["sub"],
        days=days
    )
    return ResponseBase(data=stats)


@router.get("/trends", response_model=ResponseBase[List[dict]])
async def get_training_trends(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """获取训练趋势"""
    trends = await TrainingService.get_trend_data(
        user_id=current_user["sub"],
        days=days
    )
    return ResponseBase(data=trends)


@router.get("/analysis/{session_id}", response_model=ResponseBase[AIAnalysis])
async def get_ai_analysis(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """获取AI分析结果"""
    analysis = await TrainingService.generate_ai_analysis(
        user_id=current_user["sub"],
        session_id=session_id
    )
    return ResponseBase(data=analysis)
