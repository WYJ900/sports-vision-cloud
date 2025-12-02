from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DeviceStatus(str, Enum):
    """设备状态"""
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    ERROR = "error"


class DeviceType(str, Enum):
    """设备类型"""
    ORANGE_PI = "orange_pi"
    DEPTH_CAMERA = "depth_camera"
    BALL_MACHINE = "ball_machine"


class DeviceConfig(BaseModel):
    """设备配置参数"""
    ball_speed: int = Field(default=50, ge=10, le=100, description="发球速度")
    ball_frequency: float = Field(default=2.0, ge=0.5, le=5.0, description="发球频率(秒)")
    spin_type: str = Field(default="none", description="旋转类型")
    angle_horizontal: int = Field(default=0, ge=-45, le=45, description="水平角度")
    angle_vertical: int = Field(default=0, ge=-30, le=30, description="垂直角度")


class Device(BaseModel):
    """设备模型"""
    id: Optional[str] = Field(default=None, alias="_id")
    device_id: str = Field(..., description="设备唯一标识")
    name: str
    type: DeviceType
    status: DeviceStatus = DeviceStatus.OFFLINE
    ip_address: Optional[str] = None
    firmware_version: Optional[str] = None
    config: DeviceConfig = Field(default_factory=DeviceConfig)
    owner_id: Optional[str] = None
    last_heartbeat: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class DeviceHeartbeat(BaseModel):
    """设备心跳数据"""
    device_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cpu_usage: float = Field(ge=0, le=100)
    memory_usage: float = Field(ge=0, le=100)
    temperature: float
    battery_level: Optional[float] = None
    network_latency: float
