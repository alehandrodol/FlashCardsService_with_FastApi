from fastapi import FastAPI
from fastapi.responses import HTMLResponse

from routes import routes

from core.database import database

# from starlette.requests import Request
# from starlette.responses import Response


app = FastAPI()


def gener_html(path: str) -> HTMLResponse:
    with open(path, "r") as file_html:
        html = file_html.read()
    return HTMLResponse(content=html)


@app.get("/", response_class=HTMLResponse)
def index_page():
    return gener_html("templates/index.html")


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# @app.middleware("http")
# async def db_session_middleware(request: Request, call_next):
#     response = Response("Internal server error", status_code=500)
#     try:
#         request.state.db = SessionLocal()
#         response = await call_next(request)
#     finally:
#         request.state.db.close()
#     return response


app.include_router(routes)
