from fastapi_users import FastAPIUsers
from .JWT import jwt_authentication
from .schemas import User, UserCreate, UserUpdate, UserDB
from .user_manager import get_user_manager

fastapi_users = FastAPIUsers(
    get_user_manager,
    [jwt_authentication],
    User,
    UserCreate,
    UserUpdate,
    UserDB,
)
