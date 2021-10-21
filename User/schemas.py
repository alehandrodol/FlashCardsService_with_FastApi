from fastapi_users import models
from datetime import date


class User(models.BaseUser):
    name: str
    login: str
    reg_date: date


class UserCreate(User, models.BaseUserCreate):
    pass


class UserUpdate(models.BaseUserUpdate):
    pass


class UserDB(User, models.BaseUserDB):
    pass
