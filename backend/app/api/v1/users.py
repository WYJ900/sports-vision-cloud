from fastapi import APIRouter, Depends, HTTPException, status

from ...core.security import get_current_user
from ...services.user_service import UserService
from ...models.user import UserResponse
from ...schemas.response import ResponseBase, PagedResponse

router = APIRouter(prefix="/users", tags=["用户"])


@router.get("/me", response_model=ResponseBase[UserResponse])
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """获取当前用户信息"""
    user = await UserService.get_by_id(current_user["sub"])

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return ResponseBase(data=user)


@router.get("/", response_model=ResponseBase[PagedResponse[UserResponse]])
async def get_users(
    page: int = 1,
    page_size: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """获取用户列表（管理员）"""
    skip = (page - 1) * page_size
    users = await UserService.get_all_users(skip=skip, limit=page_size)
    total = await UserService.count_users()

    return ResponseBase(
        data=PagedResponse(
            items=users,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )
    )


@router.get("/{user_id}", response_model=ResponseBase[UserResponse])
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """获取指定用户信息"""
    user = await UserService.get_by_id(user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    return ResponseBase(data=user)
