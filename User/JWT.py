from datetime import datetime, timedelta
from typing import Optional
from jose import jwt

SECRET_KEY = "e5dca1c38b84bba8de78eea35bc87f19a5043034abea710d731b63d1e841fd90"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 30


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
