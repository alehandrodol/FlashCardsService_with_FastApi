from sqlalchemy import Integer, Column, String, DateTime
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    login = Column(String, unique=True)
    email = Column(String, unique=True)
    hash_password = Column(String)
    reg_date = Column(DateTime)