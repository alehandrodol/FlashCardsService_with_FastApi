from fastapi import APIRouter
from MemoryTrainer import trainer
from User.main import fastapi_users
from User.JWT import jwt_authentication


routes = APIRouter()

routes.include_router(trainer.router, prefix="/trainer")
routes.include_router(
    fastapi_users.get_auth_router(jwt_authentication, requires_verification=False),
    prefix="/auth/jwt",
    tags=["auth"],
)
routes.include_router(
    fastapi_users.get_register_router(),
    prefix="/auth",
    tags=["auth"],
)
routes.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
routes.include_router(
    fastapi_users.get_users_router(),
    prefix="/users",
    tags=["users"],
)
