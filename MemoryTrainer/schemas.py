from pydantic import BaseModel
from datetime import datetime


class CardBase(BaseModel):
    front: str
    back: str


class CardCreate(CardBase):
    pass


class CardShow(CardBase):
    id: int


class Card(CardBase):
    id: int
    user_id: int
    date: datetime
    repeats: int
    active: bool

    class Config:
        orm_mode = True
