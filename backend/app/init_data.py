"""初始化测试数据脚本"""
import asyncio
from datetime import datetime, timedelta
import random
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


async def init_demo_data():
    """初始化演示数据"""
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.MONGO_DB]

    # 检查是否已初始化
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        print("数据已存在，跳过初始化")
        return

    print("开始初始化演示数据...")

    # 3个测试用户
    users = [
        {
            "username": "demo1",
            "email": "demo1@sports.com",
            "hashed_password": hash_password("demo123"),
            "full_name": "张三",
            "role": "user",
            "created_at": datetime.utcnow(),
            "is_active": True,
        },
        {
            "username": "demo2",
            "email": "demo2@sports.com",
            "hashed_password": hash_password("demo123"),
            "full_name": "李四",
            "role": "user",
            "created_at": datetime.utcnow(),
            "is_active": True,
        },
        {
            "username": "demo3",
            "email": "demo3@sports.com",
            "hashed_password": hash_password("demo123"),
            "full_name": "王五",
            "role": "user",
            "created_at": datetime.utcnow(),
            "is_active": True,
        },
    ]

    result = await db.users.insert_many(users)
    user_ids = result.inserted_ids
    print(f"创建了 {len(user_ids)} 个用户")

    # 为每个用户创建设备
    devices = []
    for i, user_id in enumerate(user_ids):
        device = {
            "device_id": f"OP-{str(i+1).zfill(3)}",
            "user_id": user_id,
            "name": f"训练机{i+1}号",
            "type": "orange_pi",
            "status": "online",
            "ip_address": f"192.168.1.{100+i}",
            "firmware_version": "1.2.0",
            "config": {
                "ball_speed": 50 + i * 10,
                "ball_frequency": 2.0,
                "spin_type": "none",
                "angle_horizontal": 0,
                "angle_vertical": 15,
            },
            "last_heartbeat": datetime.utcnow(),
            "created_at": datetime.utcnow(),
        }
        devices.append(device)

    await db.devices.insert_many(devices)
    print(f"创建了 {len(devices)} 个设备")

    # 为每个用户创建训练数据
    training_modes = ["standard", "intensive", "recovery"]
    
    for idx, user_id in enumerate(user_ids):
        sessions = []
        # 过去30天的训练记录
        for day in range(30):
            # 每天1-3次训练
            num_sessions = random.randint(1, 3)
            for _ in range(num_sessions):
                start_time = datetime.utcnow() - timedelta(days=day, hours=random.randint(8, 20))
                duration = random.randint(1200, 3600)  # 20-60分钟
                
                # 根据用户不同，给不同的基础数据
                base_hit_rate = 60 + idx * 8 + random.random() * 15
                base_reaction = 400 - idx * 30 + random.random() * 100
                
                session = {
                    "user_id": user_id,
                    "device_id": f"OP-{str(idx+1).zfill(3)}",
                    "start_time": start_time,
                    "end_time": start_time + timedelta(seconds=duration),
                    "duration_seconds": duration,
                    "training_mode": random.choice(training_modes),
                    "metrics": {
                        "hit_rate": min(95, base_hit_rate),
                        "reaction_time": max(200, base_reaction),
                        "accuracy": 65 + idx * 5 + random.random() * 20,
                        "fatigue_level": 30 + random.random() * 40,
                        "calories_burned": duration * 0.15 + random.random() * 50,
                        "total_hits": random.randint(100, 300),
                        "successful_hits": random.randint(60, 200),
                    },
                    "created_at": start_time,
                }
                sessions.append(session)
        
        if sessions:
            await db.training_sessions.insert_many(sessions)
            print(f"为用户 {idx+1} 创建了 {len(sessions)} 条训练记录")

    print("演示数据初始化完成!")
    print("\n测试账户信息:")
    print("=" * 40)
    print("账户1: demo1 / demo123 (张三)")
    print("账户2: demo2 / demo123 (李四)")
    print("账户3: demo3 / demo123 (王五)")
    print("=" * 40)

    client.close()


if __name__ == "__main__":
    asyncio.run(init_demo_data())
