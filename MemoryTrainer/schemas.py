from pydantic import BaseModel


class CardBase(BaseModel):
    front: str
    back: str


class CardCreate(CardBase):
    pass


class Card(CardBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True
