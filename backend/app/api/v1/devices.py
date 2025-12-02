from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ...core.security import get_current_user
from ...services.device_service import DeviceService
from ...models.device import Device, DeviceConfig, DeviceHeartbeat, DeviceStatus
from ...schemas.response import ResponseBase

router = APIRouter(prefix="/devices", tags=["设备"])


@router.post("/register", response_model=ResponseBase[Device])
async def register_device(
    device: Device,
    current_user: dict = Depends(get_current_user)
):
    """注册新设备"""
    try:
        device.owner_id = current_user["sub"]
        registered = await DeviceService.register_device(device)
        return ResponseBase(data=registered, message="设备注册成功")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/heartbeat")
async def device_heartbeat(heartbeat: DeviceHeartbeat):
    """设备心跳上报"""
    await DeviceService.heartbeat(heartbeat)
    return {"message": "心跳已接收"}


@router.get("/", response_model=ResponseBase[List[Device]])
async def get_my_devices(current_user: dict = Depends(get_current_user)):
    """获取我的设备列表"""
    devices = await DeviceService.get_user_devices(current_user["sub"])
    return ResponseBase(data=devices)


@router.get("/all", response_model=ResponseBase[List[Device]])
async def get_all_devices(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """获取所有设备（管理员）"""
    devices = await DeviceService.get_all_devices(skip=skip, limit=limit)
    return ResponseBase(data=devices)


@router.get("/{device_id}", response_model=ResponseBase[Device])
async def get_device(
    device_id: str,
    current_user: dict = Depends(get_current_user)
):
    """获取设备详情"""
    device = await DeviceService.get_device(device_id)

    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="设备不存在")

    return ResponseBase(data=device)


@router.put("/{device_id}/config", response_model=ResponseBase[bool])
async def update_device_config(
    device_id: str,
    config: DeviceConfig,
    current_user: dict = Depends(get_current_user)
):
    """更新设备配置"""
    success = await DeviceService.update_config(device_id, config)

    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="设备不存在")

    return ResponseBase(data=True, message="配置已更新")


@router.put("/{device_id}/status", response_model=ResponseBase[bool])
async def update_device_status(
    device_id: str,
    status: DeviceStatus,
    current_user: dict = Depends(get_current_user)
):
    """更新设备状态"""
    success = await DeviceService.update_status(device_id, status)

    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="设备不存在")

    return ResponseBase(data=True, message="状态已更新")
