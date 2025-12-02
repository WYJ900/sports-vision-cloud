from fastapi import APIRouter

from . import auth, users, training, devices, dashboard

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(training.router)
api_router.include_router(devices.router)
api_router.include_router(dashboard.router)
