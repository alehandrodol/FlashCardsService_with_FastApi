from fastapi import APIRouter
from MemoryTrainer import main_cards
from User import main_user


routes = APIRouter()

routes.include_router(main_cards.router, prefix="/cards")
routes.include_router(main_user.router, prefix="/user")
