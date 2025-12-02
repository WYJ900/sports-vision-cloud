from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import asyncio

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """WebSocket连接管理"""

    def __init__(self):
        # 用户连接: {user_id: {websocket1, websocket2, ...}}
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        # 设备连接: {device_id: websocket}
        self.device_connections: Dict[str, WebSocket] = {}

    async def connect_user(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)

    async def connect_device(self, websocket: WebSocket, device_id: str):
        await websocket.accept()
        self.device_connections[device_id] = websocket

    def disconnect_user(self, websocket: WebSocket, user_id: str):
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    def disconnect_device(self, device_id: str):
        if device_id in self.device_connections:
            del self.device_connections[device_id]

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_connections:
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    pass

    async def send_to_device(self, device_id: str, message: dict):
        if device_id in self.device_connections:
            try:
                await self.device_connections[device_id].send_json(message)
            except Exception:
                pass

    async def broadcast_to_users(self, message: dict):
        for user_id in self.user_connections:
            await self.send_to_user(user_id, message)


manager = ConnectionManager()


@router.websocket("/ws/user/{user_id}")
async def websocket_user(websocket: WebSocket, user_id: str):
    """用户WebSocket连接 - 接收实时数据"""
    await manager.connect_user(websocket, user_id)

    try:
        while True:
            # 接收用户命令
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif msg_type == "subscribe_device":
                # 订阅设备数据流
                device_id = data.get("device_id")
                await websocket.send_json({
                    "type": "subscribed",
                    "device_id": device_id
                })

    except WebSocketDisconnect:
        manager.disconnect_user(websocket, user_id)


@router.websocket("/ws/device/{device_id}")
async def websocket_device(websocket: WebSocket, device_id: str):
    """设备WebSocket连接 - 上报实时数据"""
    await manager.connect_device(websocket, device_id)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "pose_data":
                # 转发姿态数据给订阅用户
                user_id = data.get("user_id")
                if user_id:
                    await manager.send_to_user(user_id, {
                        "type": "pose_update",
                        "device_id": device_id,
                        "data": data.get("data")
                    })

            elif msg_type == "metrics":
                # 转发实时指标
                user_id = data.get("user_id")
                if user_id:
                    await manager.send_to_user(user_id, {
                        "type": "metrics_update",
                        "device_id": device_id,
                        "data": data.get("data")
                    })

            elif msg_type == "heartbeat":
                # 心跳响应
                await websocket.send_json({"type": "heartbeat_ack"})

    except WebSocketDisconnect:
        manager.disconnect_device(device_id)


def get_connection_manager() -> ConnectionManager:
    """获取连接管理器实例"""
    return manager
