from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import JSONResponse

from typing import List
from json import dumps

from sqlalchemy.orm import Session

from User.models import User
from User.user_manager import get_current_user

from MemoryTrainer.models import Card
from MemoryTrainer.service_funcs import delete_card_service

from core.database import get_db

from .schemas import GroupCreate, GroupBase
from .models import Group
from .service_funcs import add_and_refresh_db, check_group, get_cards_in_group_service


router = APIRouter()


@router.post("/create_group", response_class=JSONResponse)
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
    new_id = db.query(Group).filter(Group.user_id == current_user.id).order_by(Group.id.desc()).first().id
    return dumps({"status": 200, "group_id": new_id})


@router.get("/groups")
async def get_groups(current_user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)) -> List[Group]:
    if not current_user:
        return status.HTTP_401_UNAUTHORIZED
    return db.query(Group).filter(Group.user_id == current_user.id).order_by(Group.id).all()


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


@router.post("/edit_group")
async def edit_group(group_id: int, new_group: GroupBase,
                     current_user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)):

    if not current_user:
        return status.HTTP_401_UNAUTHORIZED

    is_group_exist = check_group(group_id=group_id, current_user=current_user, db=db)
    if not is_group_exist:
        raise HTTPException(status_code=400, detail="Group with this ID is not exist")

    group: Group = db.query(Group).filter(Group.id == group_id).first()
    group.name = new_group.name
    add_and_refresh_db(group, db)

    return status.HTTP_200_OK
