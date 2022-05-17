from typing import Union, Optional

from fastapi import FastAPI, Depends, status, HTTPException, Response, Request
from fastapi.responses import HTMLResponse
from starlette.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from datetime import timedelta
from routes import routes
from sqlalchemy.orm import Session

from User.JWT import ACCESS_TOKEN_EXPIRE_HOURS, create_access_token
from User.user_manager import authenticate_user
from User.schemas import Token
from User.models import User

from Group.models import Group

from core.Base import Base
from core.database import engine, get_db, SessionLocal


Base.metadata.create_all(bind=engine)
app = FastAPI()
app.mount("/static", StaticFiles(directory="templates"), name="static")

templates = Jinja2Templates(directory="templates")

favicon_path = 'favicon.ico'


@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
    return FileResponse(favicon_path)


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
def groups_page(request: Request, create_group: Optional[int] = None, group_hash: Optional[str] = None,
                db: Session = Depends(get_db)):
    name = None
    if create_group is not None:
        group: Group = db.query(Group).filter(Group.id == create_group).first()
        if group.copy_hash != "" and group.copy_hash != group_hash:
            create_group = None
        else:
            name = group.name
    return templates.TemplateResponse("inside_template.html", {"request": request, "path": "groups",
                                                               "title": "Список групп",
                                                               "copy": create_group, "copy_name": name})


@app.get("/cards", response_class=HTMLResponse)
def cards_page(request: Request, group_name: str):
    return templates.TemplateResponse("inside_template.html", {"request": request, "path": "cards",
                                                               "title": f"{group_name}"})


@app.get("/search", response_class=HTMLResponse)
def search_page(request: Request, searchString: str):
    return templates.TemplateResponse("inside_template.html", {"request": request, "path": "search",
                                                               "title": f"{searchString}"})


@app.get("/testing", response_class=HTMLResponse)
def testing_page(request: Request, group_name: str):
    return templates.TemplateResponse("testing.html", {"request": request, "path": "test",
                                                       "title": f"{group_name}"})


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
