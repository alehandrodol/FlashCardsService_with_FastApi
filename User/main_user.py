from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from .models import User
from .schemas import UserCreate
from .user_manager import get_current_user, get_user, pwd_context

router = APIRouter()


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)) -> int:
    return current_user.id


@router.get("/{user_id}}")
async def get_user_by_id(user_id: int, db: Session = Depends(get_db)) -> User:
    return db.query(User).filter(User.id == user_id).first()


@router.post("/register")
async def register(new_user: UserCreate, db: Session = Depends(get_db)):
    user = get_user(username=new_user.username, db=db)
    if user:
        raise HTTPException(status_code=400, detail="User already exist")
    hashed_pwd = pwd_context.hash(new_user.password_hash)  # at the start password is not hashed
    db_user = User(
        username=new_user.username,
        password_hash=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return status.HTTP_200_OK
