from pydantic import BaseModel
from datetime import datetime


class GroupBase(BaseModel):
    name: str


class GroupCreate(GroupBase):
    pass


class Group(GroupBase):
    id: int
    date: datetime
    user_id: int

    class Config:
        orm_mode = True


class CardBase(BaseModel):
    front: str
    back: str


class CardCreate(CardBase):
    group_id: int


class CardShow(CardBase):
    id: int


class Card(CardBase):
    id: int
    group_id: int
    date: datetime
    repeats: int
    active: bool

    class Config:
        orm_mode = True
