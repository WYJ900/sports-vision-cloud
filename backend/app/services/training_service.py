from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId
from influxdb_client import Point

from ..core.database import Database
from ..core.config import get_settings
from ..models.training import (
    TrainingSession, TrainingMetrics, PoseData,
    TrainingStatus, AIAnalysis, TrainingPlan
)

settings = get_settings()


class TrainingService:
    """训练服务"""

    @staticmethod
    def _get_collection():
        return Database.get_mongo()["training_sessions"]

    @staticmethod
    def _get_plans_collection():
        return Database.get_mongo()["training_plans"]

    @classmethod
    async def start_session(cls, user_id: str, device_id: str, mode: str = "standard") -> TrainingSession:
        """开始训练会话"""
        collection = cls._get_collection()

        session = TrainingSession(
            user_id=user_id,
            device_id=device_id,
            status=TrainingStatus.ACTIVE,
            start_time=datetime.utcnow(),
            training_mode=mode
        )

        result = await collection.insert_one(session.model_dump(exclude={"id"}))
        session.id = str(result.inserted_id)

        return session

    @classmethod
    async def end_session(cls, session_id: str, metrics: TrainingMetrics) -> TrainingSession:
        """结束训练会话"""
        collection = cls._get_collection()
        end_time = datetime.utcnow()

        session = await collection.find_one({"_id": ObjectId(session_id)})
        if not session:
            raise ValueError("训练会话不存在")

        start_time = session["start_time"]
        duration = int((end_time - start_time).total_seconds())

        await collection.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "status": TrainingStatus.COMPLETED,
                    "end_time": end_time,
                    "duration_seconds": duration,
                    "metrics": metrics.model_dump()
                }
            }
        )

        session["_id"] = str(session["_id"])
        session["status"] = TrainingStatus.COMPLETED
        session["end_time"] = end_time
        session["duration_seconds"] = duration
        session["metrics"] = metrics

        return TrainingSession(**session)

    @classmethod
    async def save_pose_data(cls, pose_data: PoseData):
        """保存姿态数据到InfluxDB"""
        write_api = Database.get_influx_write_api()

        point = (
            Point("pose_data")
            .tag("device_id", pose_data.device_id)
            .tag("user_id", pose_data.user_id)
            .field("confidence", pose_data.confidence)
            .time(pose_data.timestamp)
        )

        # 保存关键点数据
        for i, kp in enumerate(pose_data.keypoints):
            point.field(f"kp{i}_x", kp.x)
            point.field(f"kp{i}_y", kp.y)
            point.field(f"kp{i}_z", kp.z)
            point.field(f"kp{i}_v", kp.visibility)

        write_api.write(bucket=settings.INFLUX_BUCKET, record=point)

    @classmethod
    async def save_realtime_metrics(cls, user_id: str, session_id: str, metrics: dict):
        """保存实时指标到InfluxDB"""
        write_api = Database.get_influx_write_api()

        point = (
            Point("training_metrics")
            .tag("user_id", user_id)
            .tag("session_id", session_id)
            .field("hit_rate", metrics.get("hit_rate", 0))
            .field("reaction_time", metrics.get("reaction_time", 0))
            .field("accuracy", metrics.get("accuracy", 0))
            .field("fatigue_level", metrics.get("fatigue_level", 0))
            .time(datetime.utcnow())
        )

        write_api.write(bucket=settings.INFLUX_BUCKET, record=point)

    @classmethod
    async def get_user_sessions(
        cls, user_id: str, days: int = 30, limit: int = 50
    ) -> List[TrainingSession]:
        """获取用户训练历史"""
        collection = cls._get_collection()
        start_date = datetime.utcnow() - timedelta(days=days)

        cursor = collection.find({
            "user_id": user_id,
            "start_time": {"$gte": start_date}
        }).sort("start_time", -1).limit(limit)

        sessions = []
        async for session in cursor:
            session["_id"] = str(session["_id"])
            sessions.append(TrainingSession(**session))

        return sessions

    @classmethod
    async def get_session_stats(cls, user_id: str, days: int = 7) -> dict:
        """获取用户训练统计"""
        collection = cls._get_collection()
        start_date = datetime.utcnow() - timedelta(days=days)

        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "status": TrainingStatus.COMPLETED,
                    "start_time": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_sessions": {"$sum": 1},
                    "total_duration": {"$sum": "$duration_seconds"},
                    "avg_hit_rate": {"$avg": "$metrics.hit_rate"},
                    "avg_reaction_time": {"$avg": "$metrics.reaction_time"},
                    "avg_accuracy": {"$avg": "$metrics.accuracy"},
                    "total_hits": {"$sum": "$metrics.total_hits"},
                    "total_calories": {"$sum": "$metrics.calories_burned"}
                }
            }
        ]

        result = await collection.aggregate(pipeline).to_list(1)

        if not result:
            return {
                "total_sessions": 0,
                "total_duration": 0,
                "avg_hit_rate": 0,
                "avg_reaction_time": 0,
                "avg_accuracy": 0,
                "total_hits": 0,
                "total_calories": 0
            }

        return result[0]

    @classmethod
    async def get_trend_data(cls, user_id: str, days: int = 30) -> List[dict]:
        """获取训练趋势数据"""
        collection = cls._get_collection()
        start_date = datetime.utcnow() - timedelta(days=days)

        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "status": TrainingStatus.COMPLETED,
                    "start_time": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$start_time"}
                    },
                    "sessions": {"$sum": 1},
                    "avg_hit_rate": {"$avg": "$metrics.hit_rate"},
                    "avg_reaction_time": {"$avg": "$metrics.reaction_time"},
                    "total_duration": {"$sum": "$duration_seconds"}
                }
            },
            {"$sort": {"_id": 1}}
        ]

        result = await collection.aggregate(pipeline).to_list(100)
        return [{"date": r["_id"], **{k: v for k, v in r.items() if k != "_id"}} for r in result]

    @classmethod
    async def generate_ai_analysis(cls, user_id: str, session_id: str) -> AIAnalysis:
        """生成AI分析结果"""
        # 获取最近训练数据
        stats = await cls.get_session_stats(user_id, days=7)

        weaknesses = []
        strengths = []
        suggestions = []
        risk_alerts = []

        # 简单规则分析
        if stats.get("avg_hit_rate", 0) < 60:
            weaknesses.append("击球回传率偏低")
            suggestions.append("建议降低发球速度，专注于击球准确性")
        else:
            strengths.append("击球回传率良好")

        if stats.get("avg_reaction_time", 0) > 500:
            weaknesses.append("反应速度需要提升")
            suggestions.append("增加反应训练，从低频率发球开始")
        else:
            strengths.append("反应速度优秀")

        if stats.get("avg_accuracy", 0) < 70:
            weaknesses.append("姿态准确度有待提高")
            suggestions.append("关注动作规范性，可观看教学视频")

        # 疲劳度风险检测
        if stats.get("total_duration", 0) > 7200:  # 2小时
            risk_alerts.append("近期训练强度较大，注意休息")

        return AIAnalysis(
            user_id=user_id,
            session_id=session_id,
            weaknesses=weaknesses,
            strengths=strengths,
            improvement_suggestions=suggestions,
            predicted_progress=min(stats.get("avg_hit_rate", 0) * 0.1, 10),
            risk_alerts=risk_alerts
        )

    @classmethod
    async def count_today_sessions(cls) -> int:
        """统计今日训练次数"""
        collection = cls._get_collection()
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        return await collection.count_documents({
            "start_time": {"$gte": today_start}
        })
