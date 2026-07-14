import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import TelegramLinkRequest, TelegramLinkResponse

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/link-telegram", response_model=TelegramLinkResponse)
async def link_telegram(
    payload: TelegramLinkRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.telegram_link_code == payload.code)
    )
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid link code",
        )

    if target_user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Code does not belong to this user",
        )

    return TelegramLinkResponse(success=True, message="Account linked successfully")


@router.get("/link-code", response_model=TelegramLinkResponse)
async def generate_link_code(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    code = secrets.token_urlsafe(32)
    current_user.telegram_link_code = code
    await db.flush()
    return TelegramLinkResponse(success=True, message=code)
