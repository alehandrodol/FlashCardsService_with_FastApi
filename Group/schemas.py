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
    copy_hash: str = ""

    class Config:
        orm_mode = True
