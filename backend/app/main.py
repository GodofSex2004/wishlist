import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import settings
from app.core.database import init_db, async_session_factory
from app.core.security import hash_password
from app.models.models import User
from app.api import auth, items, users, admin
from app.services.scheduler import check_all_prices

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def seed_admin():
    async with async_session_factory() as db:
        result = await db.execute(select(User).where(User.is_admin == True))
        if not result.scalar_one_or_none():
            admin_user = User(
                username="admin",
                email="admin@wishlist.local",
                hashed_password=hash_password("admin123"),
                is_admin=True,
            )
            db.add(admin_user)
            await db.commit()
            logger.info("Default admin created: admin / admin123")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    await init_db()
    await seed_admin()

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    scheduler.add_job(
        check_all_prices,
        "interval",
        hours=settings.PARSER_INTERVAL_HOURS,
        id="price_check",
        replace_existing=True,
    )
    scheduler.start()

    from app.bot.telegram_bot import get_bot, get_dispatcher
    bot = get_bot()
    if bot:
        dp = get_dispatcher()
        await bot.delete_webhook()
        await bot.set_my_commands([
            {"command": "start", "description": "Open the app"},
            {"command": "link", "description": "Link your account"},
            {"command": "help", "description": "How it works"},
        ])
        import asyncio
        asyncio.ensure_future(dp.start_polling(bot))
        logger.info("Telegram bot polling started")

    yield

    scheduler.shutdown(wait=False)
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(items.router)
app.include_router(users.router)
app.include_router(admin.router)

if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")
