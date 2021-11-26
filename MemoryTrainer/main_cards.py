from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from User.models import User
from User.user_manager import get_current_user

from core.database import get_db

from .models import Card
from .schemas import CardCreate


router = APIRouter()


@router.post("/")
async def create_card(card: CardCreate,
                      current_user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED
    db_card = Card(
        front=card.front,
        back=card.back,
        user=current_user.id
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return status.HTTP_200_OK


@router.get("/")
async def get_user_cards(current_user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED
    result = db.query(Card).filter(Card.user == current_user.id).all()
    return result
