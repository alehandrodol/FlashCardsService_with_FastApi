from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class UserBase(BaseModel):
    username: str
    password_hash: str


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int
    admin: bool

    class Config:
        orm_mode = True
