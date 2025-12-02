from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import ASYNCHRONOUS
import redis.asyncio as redis
from typing import Optional

from .config import get_settings

settings = get_settings()


class Database:
    """数据库连接管理"""

    mongo_client: Optional[AsyncIOMotorClient] = None
    mongo_db: Optional[AsyncIOMotorDatabase] = None
    influx_client: Optional[InfluxDBClient] = None
    redis_client: Optional[redis.Redis] = None

    @classmethod
    async def connect(cls):
        """建立数据库连接"""
        # MongoDB
        cls.mongo_client = AsyncIOMotorClient(settings.mongo_uri)
        cls.mongo_db = cls.mongo_client[settings.MONGO_DB]

        # InfluxDB
        cls.influx_client = InfluxDBClient(
            url=settings.INFLUX_URL,
            token=settings.INFLUX_TOKEN,
            org=settings.INFLUX_ORG
        )

        # Redis
        cls.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )

        print("[DB] 数据库连接已建立")

    @classmethod
    async def disconnect(cls):
        """关闭数据库连接"""
        if cls.mongo_client:
            cls.mongo_client.close()
        if cls.influx_client:
            cls.influx_client.close()
        if cls.redis_client:
            await cls.redis_client.close()

        print("[DB] 数据库连接已关闭")

    @classmethod
    def get_mongo(cls) -> AsyncIOMotorDatabase:
        return cls.mongo_db

    @classmethod
    def get_influx_write_api(cls):
        return cls.influx_client.write_api(write_options=ASYNCHRONOUS)

    @classmethod
    def get_influx_query_api(cls):
        return cls.influx_client.query_api()

    @classmethod
    def get_redis(cls) -> redis.Redis:
        return cls.redis_client
