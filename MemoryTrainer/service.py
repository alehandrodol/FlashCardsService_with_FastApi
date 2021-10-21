from core.database import database
from .models import cards
from .schemas import CardCreate
from User.models import User


async def get_made_card():
    return await database.fetch_all(query=cards.select())


async def create_card(item: CardCreate, user: User):
    card = cards.insert().values(**item.dict(), user=user.id)
    return await database.execute(card)
