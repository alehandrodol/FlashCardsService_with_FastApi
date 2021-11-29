from sqlalchemy import Column, String, Integer, Boolean
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True)
    password_hash = Column(String)
    admin = Column(Boolean, default=False)
