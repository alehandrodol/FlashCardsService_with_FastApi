from pydantic import BaseModel


class CardBase(BaseModel):
    term: str
    value: str


class CardList(CardBase):
    id: int


class CardCreate(CardBase):
    class Config:
        orm_mode = True
