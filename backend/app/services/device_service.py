from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId
from influxdb_client import Point

from ..core.database import Database
from ..core.config import get_settings
from ..models.device import Device, DeviceStatus, DeviceConfig, DeviceHeartbeat

settings = get_settings()


class DeviceService:
    """设备服务"""

    @staticmethod
    def _get_collection():
        return Database.get_mongo()["devices"]

    @classmethod
    async def register_device(cls, device: Device) -> Device:
        """注册设备"""
        collection = cls._get_collection()

        existing = await collection.find_one({"device_id": device.device_id})
        if existing:
            raise ValueError("设备已注册")

        device_dict = device.model_dump(exclude={"id"})
        device_dict["created_at"] = datetime.utcnow()
        device_dict["updated_at"] = datetime.utcnow()

        result = await collection.insert_one(device_dict)
        device.id = str(result.inserted_id)

        return device

    @classmethod
    async def update_status(cls, device_id: str, status: DeviceStatus) -> bool:
        """更新设备状态"""
        collection = cls._get_collection()

        result = await collection.update_one(
            {"device_id": device_id},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    @classmethod
    async def update_config(cls, device_id: str, config: DeviceConfig) -> bool:
        """更新设备配置"""
        collection = cls._get_collection()

        result = await collection.update_one(
            {"device_id": device_id},
            {
                "$set": {
                    "config": config.model_dump(),
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    @classmethod
    async def heartbeat(cls, heartbeat: DeviceHeartbeat):
        """处理设备心跳"""
        collection = cls._get_collection()

        # 更新设备状态
        await collection.update_one(
            {"device_id": heartbeat.device_id},
            {
                "$set": {
                    "status": DeviceStatus.ONLINE,
                    "last_heartbeat": heartbeat.timestamp,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # 保存心跳数据到InfluxDB
        write_api = Database.get_influx_write_api()

        point = (
            Point("device_heartbeat")
            .tag("device_id", heartbeat.device_id)
            .field("cpu_usage", heartbeat.cpu_usage)
            .field("memory_usage", heartbeat.memory_usage)
            .field("temperature", heartbeat.temperature)
            .field("network_latency", heartbeat.network_latency)
            .time(heartbeat.timestamp)
        )

        if heartbeat.battery_level is not None:
            point.field("battery_level", heartbeat.battery_level)

        write_api.write(bucket=settings.INFLUX_BUCKET, record=point)

    @classmethod
    async def get_device(cls, device_id: str) -> Optional[Device]:
        """获取设备信息"""
        collection = cls._get_collection()
        device = await collection.find_one({"device_id": device_id})

        if not device:
            return None

        device["_id"] = str(device["_id"])
        return Device(**device)

    @classmethod
    async def get_user_devices(cls, user_id: str) -> List[Device]:
        """获取用户设备列表"""
        collection = cls._get_collection()
        cursor = collection.find({"owner_id": user_id})

        devices = []
        async for device in cursor:
            device["_id"] = str(device["_id"])
            devices.append(Device(**device))

        return devices

    @classmethod
    async def get_all_devices(cls, skip: int = 0, limit: int = 50) -> List[Device]:
        """获取所有设备"""
        collection = cls._get_collection()
        cursor = collection.find().skip(skip).limit(limit)

        devices = []
        async for device in cursor:
            device["_id"] = str(device["_id"])
            devices.append(Device(**device))

        return devices

    @classmethod
    async def count_online_devices(cls) -> int:
        """统计在线设备数"""
        collection = cls._get_collection()
        timeout = datetime.utcnow() - timedelta(minutes=5)

        return await collection.count_documents({
            "status": DeviceStatus.ONLINE,
            "last_heartbeat": {"$gte": timeout}
        })

    @classmethod
    async def check_offline_devices(cls):
        """检测离线设备"""
        collection = cls._get_collection()
        timeout = datetime.utcnow() - timedelta(minutes=5)

        await collection.update_many(
            {
                "status": DeviceStatus.ONLINE,
                "last_heartbeat": {"$lt": timeout}
            },
            {
                "$set": {
                    "status": DeviceStatus.OFFLINE,
                    "updated_at": datetime.utcnow()
                }
            }
        )
