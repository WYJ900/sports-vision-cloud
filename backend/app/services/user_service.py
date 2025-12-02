from typing import Optional
from datetime import datetime
from bson import ObjectId

from ..core.database import Database
from ..core.security import hash_password, verify_password
from ..models.user import UserCreate, UserInDB, UserResponse


class UserService:
    """用户服务"""

    @staticmethod
    def _get_collection():
        return Database.get_mongo()["users"]

    @classmethod
    async def create_user(cls, user_data: UserCreate) -> UserResponse:
        """创建用户"""
        collection = cls._get_collection()

        # 检查用户名/邮箱是否已存在
        existing = await collection.find_one({
            "$or": [
                {"username": user_data.username},
                {"email": user_data.email}
            ]
        })
        if existing:
            raise ValueError("用户名或邮箱已存在")

        user_dict = user_data.model_dump(exclude={"password"})
        user_dict["hashed_password"] = hash_password(user_data.password)
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        user_dict["is_active"] = True
        user_dict["is_admin"] = False

        result = await collection.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)

        return UserResponse(**user_dict)

    @classmethod
    async def authenticate(cls, username: str, password: str) -> Optional[UserInDB]:
        """用户认证"""
        collection = cls._get_collection()
        user = await collection.find_one({"username": username})

        if not user:
            return None

        if not verify_password(password, user["hashed_password"]):
            return None

        user["_id"] = str(user["_id"])
        return UserInDB(**user)

    @classmethod
    async def get_by_id(cls, user_id: str) -> Optional[UserResponse]:
        """根据ID获取用户"""
        collection = cls._get_collection()
        user = await collection.find_one({"_id": ObjectId(user_id)})

        if not user:
            return None

        user["id"] = str(user["_id"])
        return UserResponse(**user)

    @classmethod
    async def get_all_users(cls, skip: int = 0, limit: int = 50) -> list:
        """获取所有用户"""
        collection = cls._get_collection()
        cursor = collection.find().skip(skip).limit(limit)
        users = []

        async for user in cursor:
            user["id"] = str(user["_id"])
            users.append(UserResponse(**user))

        return users

    @classmethod
    async def count_users(cls) -> int:
        """统计用户数量"""
        collection = cls._get_collection()
        return await collection.count_documents({})
