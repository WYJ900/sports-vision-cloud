from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""

    # 基础配置
    APP_NAME: str = "Sports Vision Cloud"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # 安全配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24小时
    ALGORITHM: str = "HS256"

    # MongoDB配置 (支持 MongoDB Atlas URL)
    MONGO_URL: str = ""
    MONGO_HOST: str = "localhost"
    MONGO_PORT: int = 27017
    MONGO_DB: str = "sports_vision"
    MONGO_USER: str = ""
    MONGO_PASSWORD: str = ""

    @property
    def mongo_uri(self) -> str:
        # 优先使用完整URL (MongoDB Atlas)
        if self.MONGO_URL:
            return self.MONGO_URL
        if self.MONGO_USER and self.MONGO_PASSWORD:
            return f"mongodb://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_HOST}:{self.MONGO_PORT}"
        return f"mongodb://{self.MONGO_HOST}:{self.MONGO_PORT}"

    # InfluxDB配置
    INFLUX_URL: str = "http://localhost:8086"
    INFLUX_TOKEN: str = "your-influxdb-token"
    INFLUX_ORG: str = "sports_vision"
    INFLUX_BUCKET: str = "training_data"

    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # CORS配置
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://sports-vision-cloud.vercel.app",
        "https://sports-vision-cloud-sv7c.vercel.app",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
