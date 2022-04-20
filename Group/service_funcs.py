from sqlalchemy.orm import Session
from typing import List

from User.models import User
from MemoryTrainer.models import Card

from .models import Group


def check_group(group_id: int,
                current_user: User,
                db: Session) -> bool:
    users_groups: List[Group] = db.query(Group).filter(Group.user_id == current_user.id).all()
    is_group_exist = False
    for group in users_groups:
        if group.id == group_id:
            is_group_exist = True
            break
    return is_group_exist


def add_and_refresh_db(inst: Group, db: Session):
    db.add(inst)
    db.commit()
    db.refresh(inst)


def get_cards_in_group_service(group_id: int,
                               db: Session) -> List[Card]:

    cards: List[Card] = db.query(Card).filter(Card.group_id == group_id).\
        order_by(Card.active.desc(), Card.create_date.asc()).all()

    return cards

