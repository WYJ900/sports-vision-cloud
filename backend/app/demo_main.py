"""演示模式 - 无需数据库，使用内存模拟数据"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import random

app = FastAPI(title="Sports Vision Cloud - Demo Mode", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 模拟数据存储
users_db = {}
sessions_db = []
current_user_id = "demo-user-001"

# === 数据模型 ===
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400

# === 认证API ===
@app.post("/api/v1/auth/register")
async def register(req: RegisterRequest):
    if req.username in users_db:
        raise HTTPException(status_code=400, detail="用户已存在")
    users_db[req.username] = {
        "id": f"user-{len(users_db)+1}",
        "username": req.username,
        "email": req.email,
        "nickname": req.username,
        "created_at": datetime.utcnow().isoformat()
    }
    return {"code": 0, "message": "注册成功", "data": users_db[req.username]}

@app.post("/api/v1/auth/login")
async def login(req: LoginRequest):
    # 演示模式：任何用户名密码都可登录
    if req.username not in users_db:
        users_db[req.username] = {
            "id": f"user-{len(users_db)+1}",
            "username": req.username,
            "email": f"{req.username}@demo.com",
            "nickname": req.username
        }
    return {
        "code": 0,
        "message": "登录成功",
        "data": {
            "access_token": f"demo-token-{req.username}",
            "token_type": "bearer",
            "expires_in": 86400
        }
    }

# === 用户API ===
@app.get("/api/v1/users/me")
async def get_me():
    return {
        "code": 0,
        "data": {
            "id": current_user_id,
            "username": "demo",
            "email": "demo@example.com",
            "nickname": "演示用户"
        }
    }

# === 仪表盘API ===
@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats():
    return {
        "code": 0,
        "data": {
            "total_users": random.randint(50, 200),
            "active_devices": random.randint(3, 10),
            "today_sessions": random.randint(5, 20),
            "avg_hit_rate": round(random.uniform(60, 85), 1),
            "avg_reaction_time": round(random.uniform(300, 500), 0),
            "total_training_hours": round(random.uniform(10, 50), 1)
        }
    }

@app.get("/api/v1/dashboard/overview")
async def get_overview():
    return {
        "code": 0,
        "data": {
            "stats": {
                "total_sessions": 15,
                "total_duration": 3600,
                "avg_hit_rate": 72.5,
                "avg_reaction_time": 420
            },
            "trends": generate_trend_data(7),
            "devices": []
        }
    }

# === 训练API ===
@app.get("/api/v1/training/sessions")
async def get_sessions(days: int = 30):
    return {
        "code": 0,
        "data": generate_sessions(10)
    }

@app.get("/api/v1/training/stats")
async def get_stats(days: int = 7):
    return {
        "code": 0,
        "data": {
            "total_sessions": random.randint(10, 30),
            "total_duration": random.randint(3600, 10800),
            "avg_hit_rate": round(random.uniform(60, 85), 1),
            "avg_reaction_time": round(random.uniform(350, 500), 0),
            "avg_accuracy": round(random.uniform(70, 90), 1),
            "total_hits": random.randint(500, 2000),
            "total_calories": random.randint(500, 1500)
        }
    }

@app.get("/api/v1/training/trends")
async def get_trends(days: int = 30):
    return {"code": 0, "data": generate_trend_data(days)}

@app.post("/api/v1/training/sessions/start")
async def start_session(device_id: str = "demo-device", mode: str = "standard"):
    session = {
        "id": f"session-{len(sessions_db)+1}",
        "user_id": current_user_id,
        "device_id": device_id,
        "status": "active",
        "start_time": datetime.utcnow().isoformat(),
        "training_mode": mode
    }
    sessions_db.append(session)
    return {"code": 0, "message": "训练已开始", "data": session}

@app.post("/api/v1/training/sessions/{session_id}/end")
async def end_session(session_id: str):
    return {
        "code": 0,
        "message": "训练已结束",
        "data": {"id": session_id, "status": "completed"}
    }

@app.get("/api/v1/training/analysis/{session_id}")
async def get_analysis(session_id: str):
    return {
        "code": 0,
        "data": {
            "user_id": current_user_id,
            "session_id": session_id,
            "weaknesses": ["反应速度需提升", "正手击球稳定性"],
            "strengths": ["击球回传率良好", "体能状态优秀"],
            "improvement_suggestions": [
                "建议增加反应训练，从低频率发球开始",
                "关注正手动作规范性，可观看教学视频",
                "保持当前训练频率，效果明显"
            ],
            "predicted_progress": 8.5,
            "risk_alerts": []
        }
    }

# === 设备API ===
@app.get("/api/v1/devices/")
async def get_devices():
    return {
        "code": 0,
        "data": [
            {
                "id": "1",
                "device_id": "OP-001",
                "name": "主训练机",
                "type": "orange_pi",
                "status": "online",
                "ip_address": "192.168.1.100",
                "firmware_version": "1.2.0",
                "config": {
                    "ball_speed": 50,
                    "ball_frequency": 2.0,
                    "spin_type": "none",
                    "angle_horizontal": 0,
                    "angle_vertical": 10
                }
            },
            {
                "id": "2",
                "device_id": "OP-002",
                "name": "备用训练机",
                "type": "orange_pi",
                "status": "offline",
                "ip_address": "192.168.1.101",
                "firmware_version": "1.1.5",
                "config": {
                    "ball_speed": 40,
                    "ball_frequency": 2.5,
                    "spin_type": "topspin",
                    "angle_horizontal": 5,
                    "angle_vertical": 5
                }
            }
        ]
    }

@app.put("/api/v1/devices/{device_id}/config")
async def update_device_config(device_id: str):
    return {"code": 0, "message": "配置已更新", "data": True}

@app.post("/api/v1/devices/register")
async def register_device():
    return {"code": 0, "message": "设备注册成功"}

# === 辅助函数 ===
def generate_trend_data(days: int) -> List[dict]:
    data = []
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=days-i-1)).strftime("%Y-%m-%d")
        data.append({
            "date": date,
            "sessions": random.randint(1, 5),
            "avg_hit_rate": round(random.uniform(55, 85), 1),
            "avg_reaction_time": round(random.uniform(350, 550), 0),
            "total_duration": random.randint(1200, 3600)
        })
    return data

def generate_sessions(count: int) -> List[dict]:
    sessions = []
    for i in range(count):
        start = datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 12))
        duration = random.randint(600, 2400)
        sessions.append({
            "id": f"session-{i+1}",
            "_id": f"session-{i+1}",
            "user_id": current_user_id,
            "device_id": "OP-001",
            "status": "completed",
            "start_time": start.isoformat(),
            "end_time": (start + timedelta(seconds=duration)).isoformat(),
            "duration_seconds": duration,
            "training_mode": random.choice(["standard", "intensive", "recovery"]),
            "metrics": {
                "hit_rate": round(random.uniform(55, 90), 1),
                "reaction_time": round(random.uniform(300, 600), 0),
                "accuracy": round(random.uniform(65, 95), 1),
                "fatigue_level": round(random.uniform(20, 70), 0),
                "calories_burned": round(random.uniform(50, 200), 0)
            }
        })
    return sorted(sessions, key=lambda x: x["start_time"], reverse=True)

@app.get("/")
async def root():
    return {"name": "Sports Vision Cloud", "version": "1.0.0", "mode": "demo", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
