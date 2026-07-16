import logging
from typing import Optional

from aiogram import Bot, Dispatcher, Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import CommandStart, Command
from sqlalchemy import select

from app.core.config import settings
from app.core.database import async_session_factory
from app.models.models import User

logger = logging.getLogger(__name__)

_bot: Optional[Bot] = None
_dp: Optional[Dispatcher] = None
_router = Router()

APP_URL = settings.TELEGRAM_BOT_WEBHOOK_URL or "http://localhost:3000"


def get_bot() -> Bot:
    global _bot
    if _bot is None and settings.TELEGRAM_BOT_TOKEN:
        _bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    return _bot


def get_dispatcher() -> Dispatcher:
    global _dp
    if _dp is None:
        _dp = Dispatcher()
        _dp.include_router(_router)
    return _dp


def main_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Open App", callback_data="open_app")],
            [InlineKeyboardButton(text="❓ Help", callback_data="help")],
        ]
    )


def help_text() -> str:
    return (
        "🔹 *How it works*\n\n"
        "1. Add items to your wishlist\n"
        "2. Set your target price\n"
        "3. We check prices daily\n"
        "4. Get alert when price drops 🎯\n\n"
        "🔹 *Link Telegram*\n"
        "Profile → Get Telegram link code → /start <code>"
    )


@_router.message(CommandStart())
async def start_handler(message: Message):
    args = message.text.split()
    link_code = args[1] if len(args) > 1 else None

    if link_code:
        async with async_session_factory() as db:
            result = await db.execute(
                select(User).where(User.telegram_link_code == link_code)
            )
            user = result.scalar_one_or_none()

            if not user:
                await message.answer("❌ Invalid link code. Check your profile in the web app.")
                return

            user.telegram_chat_id = str(message.chat.id)
            user.telegram_link_code = None
            await db.commit()

        await message.answer(
            "✅ *Account linked!*\n\nYou'll get price alerts here.",
            parse_mode="Markdown",
            reply_markup=main_menu(),
        )
        return

    await message.answer(
        "🎯 *WISHLIST*\n\n"
        "Tap the button below to open the app 👇",
        parse_mode="Markdown",
        reply_markup=main_menu(),
    )


@_router.message(Command("link"))
async def link_handler(message: Message):
    await message.answer(
        "🔗 *Link your Telegram account*\n\n"
        "1. Open the web app\n"
        "2. Go to your Profile\n"
        "3. Tap \"Get Telegram link code\"\n"
        "4. Send: `/start <code>`",
        parse_mode="Markdown",
        reply_markup=main_menu(),
    )


@_router.message(Command("help"))
async def help_command_handler(message: Message):
    await message.answer(
        help_text(),
        parse_mode="Markdown",
        reply_markup=main_menu(),
    )


@_router.message()
async def any_message(message: Message):
    await message.answer(
        "🎯 *WISHLIST*\n\n"
        "Track prices on your wishlist items.\n"
        "Get alerts when prices drop to your target.\n\n"
        "To link your account:\n"
        "1. Open the app → Profile\n"
        "2. Tap \"Get Telegram link code\"\n"
        "3. Send: `/start <code>`",
        parse_mode="Markdown",
        reply_markup=main_menu(),
    )


@_router.callback_query(F.data == "open_app")
async def open_app_callback(callback: CallbackQuery):
    await callback.message.answer(
        f"🌐 *Open the app here:*\n{APP_URL}",
        parse_mode="Markdown",
        disable_web_page_preview=False,
    )
    await callback.answer()


@_router.callback_query(F.data == "help")
async def help_callback(callback: CallbackQuery):
    await callback.message.answer(
        help_text(),
        parse_mode="Markdown",
        reply_markup=main_menu(),
    )
    await callback.answer()


async def send_price_alert(
    chat_id: str,
    item_title: str,
    old_price: Optional[float],
    new_price: float,
    url: str,
    image_url: Optional[str] = None,
):
    bot = get_bot()
    if not bot:
        logger.warning("Telegram bot not configured, skipping alert")
        return

    old_price_str = f"${old_price:.2f}" if old_price else "N/A"
    text = (
        f"📉 *Price Drop Alert!*\n\n"
        f"*{item_title}*\n"
        f"Was: {old_price_str}\n"
        f"Now: *${new_price:.2f}*\n"
        f"[View item]({url})"
    )

    try:
        img = image_url
        if img and img.startswith("/"):
            img = f"{APP_URL}{img}"

        if img and (img.startswith("http://") or img.startswith("https://")):
            await bot.send_photo(
                chat_id=chat_id, photo=img, caption=text,
                parse_mode="Markdown",
            )
        else:
            await bot.send_message(
                chat_id=chat_id, text=text,
                parse_mode="Markdown", disable_web_page_preview=False,
            )
    except Exception as e:
        logger.error("Failed to send telegram alert: %s", e)
