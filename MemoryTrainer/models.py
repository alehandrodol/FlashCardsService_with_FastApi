from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
from User.models import User


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(250))
    value = Column(String(250))
    repeats = Column(Integer, default=0)
    active = Column(Boolean, default=True)
    create_date = Column(DateTime)
    user = Column(Integer, ForeignKey('users.id'))
    user_id = relationship(User)
