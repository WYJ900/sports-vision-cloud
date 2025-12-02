from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .core.database import Database
from .api.v1.router import api_router
from .api.v1.websocket import router as ws_router

settings = get_settings()


async def init_demo_data():
    """初始化演示数据"""
    from datetime import datetime, timedelta
    import random
    import hashlib

    db = Database.get_mongo()

    # 检查是否已初始化
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        print("[INIT] 数据已存在，跳过初始化")
        return

    print("[INIT] 开始初始化演示数据...")

    # 使用简单哈希 (演示用)
    def simple_hash(password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()

    # 3个测试用户
    users = [
        {"username": "demo1", "email": "demo1@sports.com", "hashed_password": simple_hash("demo123"), "full_name": "张三", "role": "user", "created_at": datetime.utcnow(), "is_active": True},
        {"username": "demo2", "email": "demo2@sports.com", "hashed_password": simple_hash("demo123"), "full_name": "李四", "role": "user", "created_at": datetime.utcnow(), "is_active": True},
        {"username": "demo3", "email": "demo3@sports.com", "hashed_password": simple_hash("demo123"), "full_name": "王五", "role": "user", "created_at": datetime.utcnow(), "is_active": True},
    ]
    result = await db.users.insert_many(users)
    user_ids = result.inserted_ids
    print(f"[INIT] 创建了 {len(user_ids)} 个用户")

    # 为每个用户创建设备 (user_id 转为字符串以匹配查询)
    devices = []
    for i, user_id in enumerate(user_ids):
        devices.append({
            "device_id": f"OP-{str(i+1).zfill(3)}", "user_id": str(user_id), "name": f"训练机{i+1}号",
            "type": "orange_pi", "status": "online", "ip_address": f"192.168.1.{100+i}",
            "firmware_version": "1.2.0", "config": {"ball_speed": 50+i*10, "ball_frequency": 2.0, "spin_type": "none", "angle_horizontal": 0, "angle_vertical": 15},
            "last_heartbeat": datetime.utcnow(), "created_at": datetime.utcnow(),
        })
    await db.devices.insert_many(devices)
    print(f"[INIT] 创建了 {len(devices)} 个设备")

    # 为每个用户创建训练数据 (user_id 转为字符串，添加 status 字段)
    training_modes = ["standard", "intensive", "recovery"]
    for idx, user_id in enumerate(user_ids):
        sessions = []
        for day in range(30):
            for _ in range(random.randint(1, 3)):
                start_time = datetime.utcnow() - timedelta(days=day, hours=random.randint(8, 20))
                duration = random.randint(1200, 3600)
                base_hit_rate = 60 + idx * 8 + random.random() * 15
                base_reaction = 400 - idx * 30 + random.random() * 100
                sessions.append({
                    "user_id": str(user_id), "device_id": f"OP-{str(idx+1).zfill(3)}",
                    "start_time": start_time, "end_time": start_time + timedelta(seconds=duration),
                    "duration_seconds": duration, "training_mode": random.choice(training_modes),
                    "status": "completed",
                    "metrics": {"hit_rate": min(95, base_hit_rate), "reaction_time": max(200, base_reaction),
                        "accuracy": 65+idx*5+random.random()*20, "fatigue_level": 30+random.random()*40,
                        "calories_burned": duration*0.15+random.random()*50,
                        "total_hits": random.randint(100, 300), "successful_hits": random.randint(60, 200)},
                    "created_at": start_time,
                })
        if sessions:
            await db.training_sessions.insert_many(sessions)
            print(f"[INIT] 为用户 {idx+1} 创建了 {len(sessions)} 条训练记录")

    print("[INIT] 演示数据初始化完成!")
    print("[INIT] 测试账户: demo1/demo123, demo2/demo123, demo3/demo123")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    print(f"[APP] {settings.APP_NAME} v{settings.APP_VERSION} 启动中...")
    await Database.connect()
    await init_demo_data()
    print("[APP] 服务已就绪")

    yield

    # 关闭时
    await Database.disconnect()
    print("[APP] 服务已停止")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="运动训练AI可视化云平台",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix=settings.API_PREFIX)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/admin/reset-demo-data")
async def reset_demo_data():
    """重置演示数据（仅限开发/演示环境）"""
    db = Database.get_mongo()
    
    # 清空所有集合
    await db.users.delete_many({})
    await db.devices.delete_many({})
    await db.training_sessions.delete_many({})
    
    # 重新初始化
    await init_demo_data()
    
    return {"status": "success", "message": "演示数据已重置"}
