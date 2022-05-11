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
    true_verdicts: int = 0
    repeats: int = 0


class Card(CardBase):
    id: int
    group_id: int
    date: datetime
    repeats: int
    active: bool
    true_verdicts: int = 0
    repeats: int = 0

    class Config:
        orm_mode = True


class FindString(BaseModel):
    string: str
