from sqlalchemy.orm import Session
from .models import Card
from .schemas import CardCreate


def get_make_card(db: Session):
    return db.query(Card).all()


def create_card(db: Session, item: CardCreate):
    card = Card(**item.dict())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card
