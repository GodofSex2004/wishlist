from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.core.security import get_current_user, hash_password
from app.models.models import User, WishlistItem
from app.schemas.schemas import UserOut, WishlistItemOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


@router.get("/users", response_model=List[UserOut])
async def get_all_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.id))
    return result.scalars().all()


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user_detail(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin")
    await db.delete(user)
    await db.flush()


@router.post("/users/{user_id}/make-admin", response_model=UserOut)
async def make_admin(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = True
    await db.flush()
    await db.refresh(user)
    return user


@router.get("/items", response_model=List[WishlistItemOut])
async def get_all_items(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WishlistItem).order_by(WishlistItem.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_any_item(
    item_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WishlistItem).where(WishlistItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(item)
    await db.flush()
