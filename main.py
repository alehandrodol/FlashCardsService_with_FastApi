from typing import Union

import re
import uvicorn
from fastapi import FastAPI, Depends, status, HTTPException, Response, Request
from fastapi.responses import HTMLResponse, RedirectResponse, PlainTextResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from datetime import timedelta
from routes import routes
from sqlalchemy.orm import Session

from User.JWT import ACCESS_TOKEN_EXPIRE_HOURS, create_access_token
from User.user_manager import authenticate_user, get_current_user
from User.schemas import Token
from User.models import User

from core.Base import Base
from core.database import engine, get_db, SessionLocal


Base.metadata.create_all(bind=engine)
app = FastAPI()
app.mount("/static", StaticFiles(directory="templates"), name="static")

templates = Jinja2Templates(directory="templates")


# def gener_html(path: str) -> str:
#     with open(path, "r", encoding="utf8") as file_html:
#         html = file_html.read()
#     return html


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    response = Response("Internal server error", status_code=500)
    try:
        request.state.db = SessionLocal()
        response = await call_next(request)
    finally:
        request.state.db.close()
    return response


@app.get("/", response_class=HTMLResponse)
def index_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/groups", response_class=HTMLResponse)
def get_logged(request: Request):
    return templates.TemplateResponse("inside_template.html", {"request": request, "path": "groups", "title": "Список групп"})


@app.get("/cards", response_class=HTMLResponse)
def get_logged(request: Request):
    return templates.TemplateResponse("inside_template.html", {"request": request, "path": "cards", "title": "Список карт"})


@app.get("/testing", response_class=HTMLResponse)
def get_logged(request: Request):
    return templates.TemplateResponse("testing.html", {"request": request, "path": "test", "title": "Название группы"})


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


app.include_router(routes)


# if __name__ == "__main__":
#     uvicorn.run(app=app, host="192.168.1.76", port=1234)
