import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.models.models import WishlistItem, PriceHistory, User
from app.services.parser import parse_price
from app.bot.telegram_bot import send_price_alert

logger = logging.getLogger(__name__)


async def check_all_prices():
    logger.info("Starting scheduled price check...")
    async with async_session_factory() as db:
        result = await db.execute(
            select(WishlistItem).where(WishlistItem.shop_url.isnot(None))
        )
        items = result.scalars().all()

        for item in items:
            old_price = item.current_price
            new_price = await parse_price(item.shop_url)

            if new_price is None or new_price <= 0:
                continue

            price_history = PriceHistory(
                item_id=item.id,
                price=new_price,
                checked_at=datetime.now(timezone.utc),
            )
            db.add(price_history)

            item.current_price = new_price

            if item.target_price > 0 and new_price <= item.target_price:
                result = await db.execute(
                    select(User).where(User.id == item.user_id)
                )
                user = result.scalar_one_or_none()
                if user and user.telegram_chat_id:
                    await send_price_alert(
                        chat_id=user.telegram_chat_id,
                        item_title=item.title,
                        old_price=old_price,
                        new_price=new_price,
                        url=item.shop_url,
                        image_url=item.image_url,
                    )

            logger.info("Updated price for %s: %.2f -> %.2f", item.title, old_price or 0, new_price)

        await db.commit()
    logger.info("Price check complete.")
