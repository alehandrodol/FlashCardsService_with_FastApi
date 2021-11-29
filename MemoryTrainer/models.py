from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, sql
from sqlalchemy.orm import relationship
from core.database import Base
from User.models import User
from fastapi_users_db_sqlalchemy import GUID


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    create_date = Column(DateTime(timezone=True), server_default=sql.func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship(User)


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    front = Column(String)
    back = Column(String)
    repeats = Column(Integer, default=0)
    true_verdicts = Column(Integer, default=0)
    active = Column(Boolean, default=True)
    create_date = Column(DateTime(timezone=True), server_default=sql.func.now())
    last_repeat = Column(DateTime(timezone=True), server_default=sql.func.now())
    group_id = Column(Integer, ForeignKey("groups.id"))
    group = relationship(Group)
