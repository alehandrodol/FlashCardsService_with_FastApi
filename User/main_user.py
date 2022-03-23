from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from .models import User
from .schemas import UserCreate, UserChangePass
from .user_manager import get_current_user, get_user, pwd_context, authenticate_user

router = APIRouter()


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)) -> int:

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    return current_user.id


@router.get("/{user_id}")
async def get_user_by_id(user_id: int, db: Session = Depends(get_db)) -> User:
    return db.query(User).filter(User.id == user_id).first()


@router.post("/register")
async def register(new_user: UserCreate, db: Session = Depends(get_db)):
    user = get_user(username=new_user.username, db=db)

    if user:
        raise HTTPException(status_code=400, detail="User already exist")

    hashed_pwd = pwd_context.hash(new_user.password)
    db_user = User(
        username=new_user.username,
        password_hash=hashed_pwd,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return status.HTTP_200_OK


@router.post("/change_password")
async def change_password(passwords: UserChangePass,
                          current_user: User = Depends(get_current_user),
                          db: Session = Depends(get_db)):

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    new_hashed_pwd = pwd_context.hash(passwords.new_password)

    if not authenticate_user(username=current_user.username, password=passwords.old_password, db=db):
        raise HTTPException(status_code=400, detail="Old_password_is_wrong")
    else:
        current_user.password_hash = new_hashed_pwd
        db.add(current_user)
        db.commit()
        db.refresh(current_user)

    return status.HTTP_200_OK
