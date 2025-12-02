from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ...core.security import create_access_token
from ...services.user_service import UserService
from ...models.user import UserCreate, UserResponse
from ...schemas.response import ResponseBase, TokenResponse

router = APIRouter(prefix="/auth", tags=["认证"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register", response_model=ResponseBase[UserResponse])
async def register(user_data: UserCreate):
    """用户注册"""
    try:
        user = await UserService.create_user(user_data)
        return ResponseBase(data=user, message="注册成功")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=ResponseBase[TokenResponse])
async def login(request: LoginRequest):
    """用户登录"""
    user = await UserService.authenticate(request.username, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    token = create_access_token(data={"sub": str(user.id), "username": user.username})

    return ResponseBase(
        data=TokenResponse(
            access_token=token,
            expires_in=60 * 24 * 60  # 分钟转秒
        ),
        message="登录成功"
    )


@router.post("/refresh", response_model=ResponseBase[TokenResponse])
async def refresh_token():
    """刷新令牌"""
    # TODO: 实现令牌刷新逻辑
    pass
