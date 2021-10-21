from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, sql
from sqlalchemy.orm import relationship
from core.database import Base
from User.models import User
from fastapi_users_db_sqlalchemy import GUID


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String)
    value = Column(String)
    repeats = Column(Integer, default=0)
    active = Column(Boolean, default=True)
    create_date = Column(DateTime(timezone=True), server_default=sql.func.now())
    user = Column(GUID, ForeignKey("user.id"))
    user_id = relationship(User)


cards = Card.__table__
