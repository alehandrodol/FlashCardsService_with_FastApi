import re

from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.database import get_db
from .models import User
from .schemas import UserCreate, UserChangePass
from .user_manager import get_current_user, get_user, pwd_context, authenticate_user

router = APIRouter()


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)) -> int:

    return current_user.id


@router.get("/{user_id}")
async def get_user_by_id(user_id: int, db: Session = Depends(get_db)) -> User:
    return db.query(User).filter(User.id == user_id).first()


@router.post("/register")
async def register(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(username=form_data.username, db=db)

    if user:
        raise HTTPException(status_code=426, detail="User already exist")

    # if not 8 <= len(form_data.password) <= 50:
    #     raise HTTPException(status_code=400, detail="Password lenght must be not less than 8 and no more than 50")

    if not len(form_data.username) > 0:
        raise HTTPException(status_code=400, detail="Username must not be empty")

    if re.search(r'^[a-zA-Z0-9!@#$%^&*_+={}:;`\'"?~|<>-]*$', form_data.username) is None:
        raise HTTPException(status_code=400,
                            detail="Bad login: Use only latin letters or may be you use some exotic symbols")

    regular_exp_hard = r'^(?=.*[0-9])(?=.*[!@#$%^&*_+={}:;`"?~|<>-])[a-zA-Z0-9!@#$%^&*_+={}:;`\'"?~|<>-]*$'
    regular_exp_easy = r'^[a-zA-Z0-9!@#$%^&*_+={}:;`\'"?~|<>-]*$'
    if re.search(regular_exp_easy,
                 form_data.password) is None:
        detail_hard = "Password should contain at least one number and one special character " \
                      "(or you use unsupported character)"
        detail_easy = "Seems that you use unsupported characters, try to use another pass"
        raise HTTPException(status_code=400,
                            detail=detail_easy)

    hashed_pwd = pwd_context.hash(form_data.password)
    db_user = User(
        username=form_data.username,
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
