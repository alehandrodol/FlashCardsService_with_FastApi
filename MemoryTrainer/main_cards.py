from datetime import datetime

from fastapi import APIRouter, Depends, status, HTTPException, Response, Cookie
from sqlalchemy.orm import Session

from typing import List, Dict, Optional
from random import randint
from json import loads, dumps

from User.models import User
from User.user_manager import get_current_user

from core.database import get_db

from .models import Card, Group
from .schemas import CardCreate, CardShow, GroupCreate
from .service_funcs import get_cards_in_group_service, delete_card_service, \
    get_group_cards_service, add_and_refresh_db, get_group_card, check_group

router = APIRouter()


"""def sort_CARDS() -> None:
    global CARDS
    temp_card_list: Dict[float] = {x: 0 for x in range(len(CARDS))}
    for ind, card in enumerate(CARDS):
        if card.active:
            temp_card_list[ind] += 1
        if card.repeats <= 3:
            temp_card_list[ind] *= 2
    return"""


@router.post("/create_group")
async def create_group(group: GroupCreate,
                       current_user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED
    db_group = Group(
        name=group.name,
        user_id=current_user.id
    )
    add_and_refresh_db(db_group, db)
    return status.HTTP_200_OK


@router.get("/groups")
async def get_groups(current_user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)) -> List[Group]:
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED
    return db.query(Group).filter(Group.user_id == current_user.id).all()


@router.post("/create_card")
async def create_card(card: CardCreate,
                      response: Response,
                      current_user: User = Depends(get_current_user),
                      db: Session = Depends(get_db),
                      card_dict: Optional[str] = Cookie(default="{}")):
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED
    is_group_exist = check_group(group_id=card.group_id, current_user=current_user, db=db)
    if not is_group_exist:
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")
    card_dict: Dict[str, List[int]] = loads(card_dict)
    card_dict[str(card.group_id)] = []
    db_card = Card(
        front=card.front,
        back=card.back,
        group_id=card.group_id
    )
    add_and_refresh_db(db_card, db)
    response.set_cookie(key="card_dict", value=dumps(card_dict))
    return status.HTTP_200_OK


@router.get("/cards_in/{group_id}")
async def get_cards_in_group(group_id: int,
                             current_user: User = Depends(get_current_user),
                             db: Session = Depends(get_db)) -> List[Card]:
    """This function returns all cards in group by id, only for authorized user"""

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    if not check_group(group_id=group_id, db=db, current_user=current_user):
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")

    cards = get_cards_in_group_service(group_id=group_id, db=db)

    return cards


@router.get("/next/{group_id}")
async def get_next_card(group_id: int,
                        response: Response,
                        current_user: User = Depends(get_current_user),
                        db: Session = Depends(get_db),
                        card_dict: Optional[str] = Cookie(default="{}")) -> Card:
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    is_group_exist = check_group(group_id=group_id, current_user=current_user, db=db)
    if not is_group_exist:
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")
    card_dict: Dict[str, List[int]] = loads(card_dict)
    try:
        len(card_dict[str(group_id)])
    except KeyError:
        card_dict[str(group_id)] = []
    finally:
        if len(card_dict[str(group_id)]) == 0:
            get_group_cards_service(group_id=group_id, db=db, response=response, card_dict=card_dict)
        if len(card_dict[str(group_id)]) == 0:
            raise HTTPException(status_code=400, detail="Group with this ID is empty")

    #  sort_CARDS()
    rand_num: int = randint(0, len(card_dict[str(group_id)]) - 1)
    card: Card = db.query(Card).filter(Card.id == card_dict[str(group_id)][rand_num]).first()
    card_dict[str(group_id)].pop(rand_num)
    response.set_cookie(key="card_id", value=str(card.id))
    response.set_cookie(key="card_dict", value=dumps(card_dict))
    return card


@router.post("/repeated")
async def set_verdict(verdict: bool,
                      db: Session = Depends(get_db),
                      card_id: Optional[str] = Cookie(default=None)):
    if card_id is None:
        raise HTTPException(status_code=405, detail="You don't have a card for verdict")

    temp_card: Card = db.query(Card).filter(Card.id == int(card_id)).first()
    if verdict:
        if temp_card.true_verdicts + 1 > 4 and temp_card.repeats // 2 < temp_card.true_verdicts + 1:
            temp_card.active = False
        else:
            temp_card.true_verdicts += 1
    temp_card.repeats += 1
    temp_card.last_repeat = datetime.now()
    add_and_refresh_db(temp_card, db)
    return status.HTTP_200_OK


@router.post("/activate")
async def activate_cards_by_id(id_list: List[int],
                               current_user: User = Depends(get_current_user),
                               db: Session = Depends(get_db)):
    """This function changes cell in column 'active' in table 'cards' to True state if it was False,
    only for authorized users."""

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    activated: List[int] = []
    for cur_id in id_list:
        temp_card: Card = db.query(Card).filter(Card.id == cur_id).first()

        if temp_card is None:
            raise HTTPException(status_code=400, detail=f"You don't have card with {cur_id} ID, "
                                                        f"but these cards were activated: {activated}")

        if not check_group(group_id=temp_card.group_id, current_user=current_user, db=db):
            raise HTTPException(status_code=400, detail=f"You don't have card with {cur_id} ID, "
                                                        f"but these cards were activated: {activated}")

        if temp_card.active:
            continue

        temp_card.repeats = 0
        temp_card.active = True
        temp_card.true_verdicts = 0

        activated.append(cur_id)
        add_and_refresh_db(temp_card, db)
    return status.HTTP_200_OK


@router.get("/not_active_cards/{group_id}")
async def get_not_active_cards(group_id: int,
                               current_user: User = Depends(get_current_user),
                               db: Session = Depends(get_db)) -> List[CardShow]:
    """This function returns cards_id as List from given group"""

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    if not check_group(group_id=group_id, db=db, current_user=current_user):
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")

    result: List[CardShow] = []
    temp_list: List[Card] = db.query(Card).filter(Card.active == False, Card.group_id == group_id).all()
    for card in temp_list:
        temp_card: CardShow = CardShow(
            front=card.front,
            back=card.back,
            id=card.id,
            group_id=card.group_id
        )
        result.append(temp_card)
    return result


@router.post("/delete_group")
async def delete_group(group_id: int,
                       current_user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    """This function deletes group by id, only for authorized user"""

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    is_group_exist = check_group(group_id=group_id, current_user=current_user, db=db)
    if not is_group_exist:
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")

    cards = get_cards_in_group_service(group_id=group_id, db=db)

    for card in cards:
        delete_card_service(card_id=card.id, db=db)

    group = db.query(Group).filter(Group.id == group_id).first()

    db.delete(group)
    db.commit()

    return status.HTTP_200_OK


@router.post("/delete_cards")
async def delete_cards(cards_id: List[int],
                       current_user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    """Delete cards from table 'cards' by id. You can delete cards only for authorized user"""

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    deleted_cards: List[int] = []
    for cur_card_id in cards_id:
        group_id = get_group_card(card_id=cur_card_id, db=db)
        if group_id is None:
            raise HTTPException(status_code=400, detail=f"You don't have card with {cur_card_id} ID, "
                                                        f"but these cards were deleted: {deleted_cards}")
        is_group_exist = check_group(group_id=group_id, current_user=current_user, db=db)
        if not is_group_exist:
            raise HTTPException(status_code=400, detail=f"You don't have card with {cur_card_id} ID, "
                                                        f"but these cards were deleted: {deleted_cards}")
        deleted_cards.append(cur_card_id)
        delete_card_service(card_id=cur_card_id, db=db)

    return status.HTTP_200_OK
