from pydantic import BaseModel
from datetime import datetime


class CardBase(BaseModel):
    front: str = ""
    back: str = ""
    descriptionText: str = ""


class CardCreate(CardBase):
    group_id: int


class CardShow(CardBase):
    id: int = -1
    group_id: int = -1


class Card(CardBase):
    id: int
    group_id: int
    date: datetime
    repeats: int
    active: bool

    class Config:
        orm_mode = True
