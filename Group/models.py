from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, sql
from sqlalchemy.orm import relationship
from core.database import Base
from User.models import User


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    create_date = Column(DateTime(timezone=True), server_default=sql.func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship(User)
