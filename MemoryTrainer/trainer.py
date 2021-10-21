from typing import List
from fastapi import APIRouter, Depends

from User.models import User
from User.main import fastapi_users
from . import service
from .schemas import CardCreate, CardList

router = APIRouter()


@router.get("/", response_model=List[CardList])
async def make_card():
    return await service.get_made_card()


@router.post("/")
async def make_card(item: CardCreate, user: User = Depends(fastapi_users.current_user())):
    return await service.create_card(item, user)
