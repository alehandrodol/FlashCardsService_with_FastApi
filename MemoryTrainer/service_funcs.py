from typing import List, Dict, Union, Optional
from json import dumps

from fastapi import Depends, Response

from sqlalchemy.orm import Session

from core.database import get_db

from User.models import User

from .models import Card, Group


def get_cards_in_group_service(group_id: int,
                               db: Session = Depends(get_db)) -> List[Card]:

    cards: List[Card] = db.query(Card).filter(Card.group_id == group_id).all()

    return cards


def delete_card_service(card_id: int,
                        db: Session = Depends(get_db)) -> None:
    cur_card = db.query(Card).filter(Card.id == card_id).first()
    db.delete(cur_card)
    db.commit()
    return


def get_group_cards_service(group_id: int,
                            response: Response,
                            card_dict: Dict[str, List[int]],
                            db: Session = Depends(get_db)) -> None:
    list_card: List[Card] = db.query(Card).filter(Card.group_id == group_id, Card.active == True).all()
    for card in list_card:
        card_dict[str(group_id)].append(card.id)
    response.set_cookie(key="card_dict", value=dumps(card_dict))
    return


def add_and_refresh_db(inst: Union[Card, Group], db: Session):
    db.add(inst)
    db.commit()
    db.refresh(inst)


def get_group_card(card_id: int, db: Session = Depends(get_db)):
    """This function returns group_id for card by given id"""

    card: Optional[Card] = db.query(Card).filter(Card.id == card_id).first()
    if card is None:
        return None
    return card.group_id


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
