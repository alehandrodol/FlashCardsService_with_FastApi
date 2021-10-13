from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class CardBase(BaseModel):
    term: str
    value: str
    create_date: datetime

    class Config:
        orm_mode = True


class CardList(CardBase):
    id: int


class CardCreate(CardBase):
    pass
