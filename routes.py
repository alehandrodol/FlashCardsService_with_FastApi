from fastapi import APIRouter
from MemoryTrainer import main_cards


routes = APIRouter()

routes.include_router(main_cards.router, prefix="/cards")

