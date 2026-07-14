import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, WishlistItem, ItemCategory
from app.schemas.schemas import WishlistItemOut, WishlistItemUpdate

router = APIRouter(prefix="/api/items", tags=["items"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def _save_upload(file: UploadFile) -> Optional[str]:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return None
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    content = file.file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    return f"/static/{filename}"


@router.get("", response_model=List[WishlistItemOut])
async def get_items(
    category: Optional[ItemCategory] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(WishlistItem).where(WishlistItem.user_id == current_user.id)
    if category:
        stmt = stmt.where(WishlistItem.category == category)
    stmt = stmt.order_by(WishlistItem.created_at.desc())
    result = await db.execute(stmt)
    items = result.scalars().all()
    return items


@router.post("", response_model=WishlistItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    title: str = Form(...),
    brand: str = Form(default=""),
    shop_url: str = Form(default=""),
    target_price: float = Form(default=0.0),
    category: ItemCategory = Form(default=ItemCategory.SAVE_UP),
    comment: str = Form(default=""),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    image_url = _save_upload(image) if image else None

    item = WishlistItem(
        user_id=current_user.id,
        title=title,
        brand=brand,
        image_url=image_url,
        shop_url=shop_url or None,
        target_price=target_price,
        category=category,
        comment=comment or None,
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


@router.get("/{item_id}", response_model=WishlistItemOut)
async def get_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WishlistItem).where(WishlistItem.id == item_id, WishlistItem.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=WishlistItemOut)
async def update_item(
    item_id: int,
    payload: WishlistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WishlistItem).where(WishlistItem.id == item_id, WishlistItem.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    await db.flush()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WishlistItem).where(WishlistItem.id == item_id, WishlistItem.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    await db.delete(item)
    await db.flush()
