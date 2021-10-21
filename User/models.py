from sqlalchemy import Column, String, Date
from core.database import Base
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from core.database import database
from .schemas import UserDB


class User(Base, SQLAlchemyBaseUserTable):
    name = Column(String)
    login = Column(String, unique=True)
    reg_date = Column(Date)


users = User.__table__


def get_user_db():
    yield SQLAlchemyUserDatabase(UserDB, database, users)
