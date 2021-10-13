from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.utils import get_db
from . import service
from .schemas import CardCreate, CardList

router = APIRouter()


@router.get("/", response_model=List[CardList])
def make_card(db: Session = Depends(get_db)):
    card = service.get_make_card(db)
    return card


@router.post("/")
def make_card(item: CardCreate, db: Session = Depends(get_db)):
    card = service.create_card(db, item)
    return card
