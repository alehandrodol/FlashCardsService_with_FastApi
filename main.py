from typing import Union

from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm

from datetime import timedelta
from routes import routes
from sqlalchemy.orm import Session

from User.JWT import ACCESS_TOKEN_EXPIRE_HOURS, create_access_token
from User.user_manager import pwd_context, authenticate_user, get_current_user, get_user
from User.schemas import UserCreate, Token
from User.models import User

from core.Base import Base
from core.database import engine, get_db


Base.metadata.create_all(bind=engine)
app = FastAPI()


def gener_html(path: str) -> HTMLResponse:
    with open(path, "r") as file_html:
        html = file_html.read()
    return HTMLResponse(content=html)


@app.get("/", response_class=HTMLResponse)
def index_page():
    return gener_html("templates/index.html")


@app.post("/register")
async def register(new_user: UserCreate, db: Session = Depends(get_db)):
    user = get_user(username=new_user.username, db=db)
    if not user:
        hashed_pwd = pwd_context.hash(new_user.password_hash)  # at the start password is not hashed
        db_user = User(
            username=new_user.username,
            password_hash=hashed_pwd
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return status.HTTP_200_OK


@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user: Union[User, bool] = authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires  # user.username is already not a bool exactly
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me")
async def me(current_user: User = Depends(get_current_user)) -> int:
    return current_user.id


app.include_router(routes)
