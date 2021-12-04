from fastapi import APIRouter
from MemoryTrainer import main_cards
from User import main_user
from Group import main_groups


routes = APIRouter()

routes.include_router(main_cards.router, prefix="/cards")
routes.include_router(main_user.router, prefix="/user")
routes.include_router(main_groups.router, prefix="/group")
