from typing import List, Dict, Tuple, Union, Optional
from json import dumps

from fastapi import Depends, Response

from sqlalchemy.orm import Session

from core.database import get_db

from User.models import User

from .models import Card, Group


def delete_card_service(card_id: int,
                        db: Session) -> None:
    cur_card = db.query(Card).filter(Card.id == card_id).first()
    db.delete(cur_card)
    db.commit()
    return


def get_group_cards_service(group_id: int,
                            response: Response,
                            card_dict: Dict[str, List[int]],
                            db: Session) -> None:
    list_card: List[Card] = db.query(Card).filter(Card.group_id == group_id, Card.active == True).all()
    for card in list_card:
        card_dict[str(group_id)].append(card.id)
    response.set_cookie(key="card_dict", value=dumps(card_dict))
    return


def add_and_refresh_db(inst: Card, db: Session):
    db.add(inst)
    db.commit()
    db.refresh(inst)


def get_group_card(card_id: int, db: Session):
    """This function returns group_id for card by given id"""

    card: Optional[Card] = db.query(Card).filter(Card.id == card_id).first()
    if card is None:
        return None
    return card.group_id


def binary_search(lys, val):
    first = 0
    last = len(lys) - 1
    index = -1
    while (first <= last) and (index == -1):
        mid = (first + last) // 2
        if lys[mid] == val:
            index = mid
        else:
            if val < lys[mid]:
                last = mid - 1
            else:
                first = mid + 1
    return index


def find_largest_substring(str1: str, str2: str) -> Optional[Tuple[int, int]]:
    len_2 = len(str2)
    if len_2 == 0:
        return None
    if len_2 < 3:
        return str1.index(str2), len_2
    matrix: List[List[int]] = [[] for x in range(len_2-2)]
    for part_ind in range(len_2-2):
        part = str2[part_ind:part_ind+3]
        start = 0
        while True:
            try:
                find_ind = str1.index(part, start)
            except ValueError:
                break
            start = find_ind + 1
            matrix[part_ind].append(find_ind)

    max_len = -1
    max_ind = -1
    for i in range(len(matrix)-1):
        for j in range(len(matrix[i])):
            cur_len = 3
            cur_list_ind = i
            cur_elem = matrix[i][j]
            bin_s = binary_search(matrix[cur_list_ind+1], cur_elem+1)
            while bin_s != -1:
                cur_len += 1
                cur_elem += 1
                cur_list_ind += 1
                if cur_list_ind + 1 < len_2-2:
                    bin_s = binary_search(matrix[cur_list_ind + 1], cur_elem + 1)
                else:
                    break
            if cur_len > max_len:
                max_len = cur_len
                max_ind = matrix[i][j]
    return max_ind, max_len
