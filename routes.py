from fastapi import APIRouter
from MemoryTrainer import trainer


routes = APIRouter()

routes.include_router(trainer.router, prefix="/trainer")
