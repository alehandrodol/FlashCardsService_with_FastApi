import re

from datetime import datetime

from fastapi import APIRouter, Depends, status, HTTPException, Response, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from typing import List, Dict, Optional, Tuple
from random import randint
from json import loads, dumps

from User.models import User
from User.user_manager import get_current_user

from Group.service_funcs import check_group
from Group.models import Group

from core.database import get_db

from .models import Card
from .schemas import CardCreate, CardShow, CardBase
from .service_funcs import delete_card_service, \
    get_group_cards_service, add_and_refresh_db, get_group_card, find_largest_substring

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


@router.post("/create_card", response_class=JSONResponse)
async def create_card(card: CardCreate,
                      current_user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    if len(card.front) > 200:
        raise HTTPException(status_code=400, detail="Too long front part of the card")

    if len(card.back) > 200:
        raise HTTPException(status_code=400, detail="Too long back part of the card")

    if re.search(r'^[\u0400-\u04FFa-zA-Z0-9.,№\[\]\\/! @#$%^&*_+={}:;`\'"?~|<>-]*$', card.front) is None:
        raise HTTPException(status_code=400, detail="You have used unsupported symbol in front")

    if re.search(r'^[\u0400-\u04FFa-zA-Z0-9.,№\[\]\\/! @#$%^&*_+={}:;`\'"?~|<>-]*$', card.back) is None:
        raise HTTPException(status_code=400, detail="You have used unsupported symbol in back")

    is_group_exist = check_group(group_id=card.group_id, current_user=current_user, db=db)
    if not is_group_exist:
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")
    db_card = Card(
        front=card.front,
        back=card.back,
        descriptionText=card.descriptionText,
        group_id=card.group_id
    )
    add_and_refresh_db(db_card, db)
    new_id = db.query(Card).filter(Card.group_id == card.group_id).order_by(Card.id.desc()).first().id
    return dumps({"status": 200, "card_id": new_id, "active": True})


@router.get("/find_by_string")
async def find_cards(string: str, search_in: Optional[int] = None,
                     current_user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)) -> List[Tuple[Card, int, str]]:
    if search_in is not None:
        user_groups = [db.query(Group).filter(Group.id == search_in).first()]
    else:
        user_groups = db.query(Group).filter(Group.user_id == current_user.id).all()

    if len(string) == 0:
        raise HTTPException(status_code=400, detail="Can't find by zero string")

    min_len = float("inf")
    res_list: List[Tuple[Card, int, str]] = []
    for group in user_groups:
        cards: List[Card] = db.query(Card).filter(Card.group_id == group.id).all()
        for cur_card in cards:
            find_on_front = find_largest_substring(cur_card.front, string)
            find_on_back = find_largest_substring(cur_card.back, string)
            find_on_desc = find_largest_substring(cur_card.descriptionText, string)
            if find_on_front != (-1, -1) or find_on_back != (-1, -1) or find_on_desc != (-1, -1):
                cur_max_len = max(find_on_front[1], find_on_back[1], find_on_desc[1])
                if cur_max_len <= len(string) // 2:
                    continue
                if cur_max_len <= min_len and len(res_list) >= 15:
                    continue
                elif cur_max_len <= min_len:
                    min_len = cur_max_len
                elif cur_max_len > min_len and len(res_list) >= 15:
                    res_list = sorted(res_list, key=lambda x: x[1])
                    res_list.pop(0)
                group_name: Group = db.query(Group).filter(Group.id == cur_card.group_id).first()
                res_list.append((cur_card, cur_max_len, group_name.name))
                continue
    return sorted(res_list, key=lambda x: x[1])


@router.get("/get_card", response_model=CardShow)
async def get_card(given_id: int,
                   current_user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    card: Card = db.query(Card).filter(Card.id == given_id).first()

    if not check_group(group_id=card.group_id, current_user=current_user, db=db):
        raise HTTPException(status_code=400, detail=f"You don't have card with {given_id} ID")

    res_card: CardShow = CardShow(
        front=card.front,
        back=card.back,
        id=card.id,
        group_id=card.group_id,
        descriptionText=card.descriptionText,
        repeats=card.repeats,
        true_verdicts=card.true_verdicts
    )
    return res_card


@router.get("/next/{group_id}", response_model=CardShow, status_code=200)
async def get_next_card(group_id: int,
                        response: Response,
                        current_user: User = Depends(get_current_user),
                        db: Session = Depends(get_db),
                        card_dict: Optional[str] = Cookie(default="{}")) -> CardShow:
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    is_group_exist = check_group(group_id=group_id, current_user=current_user, db=db)
    if not is_group_exist:
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")
    card_dict: Dict[str, List[int]] = loads(card_dict)
    first_call = False

    try:
        len(card_dict[str(group_id)])
    except KeyError:
        card_dict[str(group_id)] = []
        first_call = True
    finally:
        if len(card_dict[str(group_id)]) == 0:
            get_group_cards_service(group_id=group_id, db=db, response=response, card_dict=card_dict)
            if not first_call:
                response.set_cookie(key="card_dict", value=dumps(card_dict))
                response.status_code = status.HTTP_205_RESET_CONTENT
                return CardShow()
        if len(card_dict[str(group_id)]) == 0:
            raise HTTPException(status_code=400, detail="Group with this ID is empty")

    #  sort_CARDS()
    rand_num: int = randint(0, len(card_dict[str(group_id)]) - 1)
    card: Card = db.query(Card).filter(Card.id == card_dict[str(group_id)][rand_num]).first()
    card_dict[str(group_id)].pop(rand_num)
    response.set_cookie(key="card_id_dict", value=dumps({"ID": card.id, "is_verdict": False}))
    response.set_cookie(key="card_dict", value=dumps(card_dict))
    show_card: CardShow = CardShow(
        front=card.front,
        back=card.back,
        id=card.id,
        group_id=card.group_id,
        descriptionText=card.descriptionText,
        true_verdicts=card.true_verdicts,
        repeats=card.repeats
    )
    return show_card


@router.post("/repeated")
async def set_verdict(verdict: bool,
                      response: Response,
                      db: Session = Depends(get_db),
                      card_id_dict: Optional[str] = Cookie(default=None)):
    card_id_dict: Dict[(str, int), (str, bool)] = loads(card_id_dict)
    card_id: int = card_id_dict["ID"]
    is_verdict: bool = card_id_dict["is_verdict"]
    if is_verdict or card_id is None:
        raise HTTPException(status_code=405, detail="You don't have a card for verdict")

    temp_card: Card = db.query(Card).filter(Card.id == int(card_id)).first()
    if verdict:
        if temp_card.true_verdicts + 1 > 4 and temp_card.repeats // 2 < temp_card.true_verdicts + 1:
            temp_card.active = False
        temp_card.true_verdicts += 1
    temp_card.repeats += 1
    temp_card.last_repeat = datetime.now()
    add_and_refresh_db(temp_card, db)
    response.set_cookie(key="card_id_dict", value=dumps({"ID": card_id, "is_verdict": True}))
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


@router.post("/deactivate")
async def deactivate_cards_by_id(id_list: List[int],
                                 current_user: User = Depends(get_current_user),
                                 db: Session = Depends(get_db)):
    """This function changes cell in column 'active' in table 'cards' to False state if it was True,
    only for authorized users."""

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    deactivated: List[int] = []
    for cur_id in id_list:
        temp_card: Card = db.query(Card).filter(Card.id == cur_id).first()

        if temp_card is None:
            raise HTTPException(status_code=400, detail=f"You don't have card with {cur_id} ID, "
                                                        f"but these cards were deactivated: {deactivated}")

        if not check_group(group_id=temp_card.group_id, current_user=current_user, db=db):
            raise HTTPException(status_code=400, detail=f"You don't have card with {cur_id} ID, "
                                                        f"but these cards were deactivated: {deactivated}")

        if not temp_card.active:
            continue

        temp_card.active = False

        deactivated.append(cur_id)
        add_and_refresh_db(temp_card, db)
    return status.HTTP_200_OK


@router.get("/active_or_not_cards/{group_id}", response_class=JSONResponse)
async def get_not_active_cards(group_id: int, is_active: bool,
                               current_user: User = Depends(get_current_user),
                               db: Session = Depends(get_db)) -> List[int]:
    """This function returns cards_id as List from given group"""

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    if not check_group(group_id=group_id, db=db, current_user=current_user):
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")

    print("KU-Ku")

    result: List[int] = []
    temp_list: List[Card] = db.query(Card).filter(Card.active == is_active, Card.group_id == group_id).all()
    for card in temp_list:
        result.append(card.id)
    return result


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


@router.post("/edit_card")
async def edit_card(card_id: int, new_card: CardBase,
                    current_user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    if len(new_card.front) > 200:
        raise HTTPException(status_code=400, detail="Too long front part of the card")

    if len(new_card.back) > 200:
        raise HTTPException(status_code=400, detail="Too long back part of the card")

    if len(new_card.front) < 1:
        raise HTTPException(status_code=400, detail="Front part of the card must not be empty")

    if re.search(r'^[\u0400-\u04FFa-zA-Z0-9.,№\[\]\\/! @#$%^&*_+={}:;`\'"?~|<>-]*$', new_card.front) is None:
        raise HTTPException(status_code=400, detail="You have used unsupported symbol in front")

    if re.search(r'^[\u0400-\u04FFa-zA-Z0-9.,№\[\]\\/! @#$%^&*_+={}:;`\'"?~|<>-]*$', new_card.back) is None:
        raise HTTPException(status_code=400, detail="You have used unsupported symbol in back")

    group_id = get_group_card(card_id=card_id, db=db)
    if group_id is None:
        raise HTTPException(status_code=400, detail=f"You don't have card with {card_id} ID")

    is_group_exist = check_group(group_id=group_id, current_user=current_user, db=db)
    if not is_group_exist:
        raise HTTPException(status_code=400, detail=f"You don't have card with {card_id} ID")

    card: Card = db.query(Card).filter(Card.id == card_id).first()
    card.front = new_card.front
    card.back = new_card.back
    card.descriptionText = new_card.descriptionText
    add_and_refresh_db(card, db)

    return status.HTTP_200_OK
