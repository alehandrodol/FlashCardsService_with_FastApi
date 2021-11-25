from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from jose import jwt, JWTError
from passlib.context import CryptContext

from .JWT import SECRET_KEY, ALGORITHM
from .models import User

from core.database import get_db

from typing import Union
from sqlalchemy.orm import Session


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_user(username: str, db: Session) -> User:
    user = db.query(User).filter(User.username == username).first()
    if user:
        return user


def authenticate_user(username: str, password: str, db: Session) -> Union[User, bool]:
    user: User = get_user(username=username, db=db)
    if not user:
        return False
    if not pwd_context.verify(password, user.password_hash):
        return False
    return user


async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user: User = get_user(db=db, username=username)
    # if user is None:
    #     raise credentials_exception
    # Thought it would be better to still return None without exception to handle it correctly
    return user
