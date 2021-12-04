from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class UserBase(BaseModel):
    username: str
    password: str


class UserCreate(UserBase):
    pass


class UserChangePass(BaseModel):
    old_password: str
    new_password: str


class User(UserBase):
    id: int
    admin: bool

    class Config:
        orm_mode = True
