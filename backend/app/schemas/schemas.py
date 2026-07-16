from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

from app.models.models import ItemCategory, ItemStatus


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool = False
    telegram_chat_id: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class WishlistItemCreate(BaseModel):
    title: str = Field(..., max_length=255)
    brand: str = Field(default="", max_length=100)
    shop_url: Optional[str] = None
    target_price: float = Field(default=0.0, ge=0)
    category: ItemCategory = ItemCategory.OTHER
    comment: Optional[str] = None


class WishlistItemUpdate(BaseModel):
    title: Optional[str] = None
    brand: Optional[str] = None
    shop_url: Optional[str] = None
    target_price: Optional[float] = None
    category: Optional[ItemCategory] = None
    status: Optional[ItemStatus] = None
    comment: Optional[str] = None
    current_price: Optional[float] = None


class WishlistItemOut(BaseModel):
    id: int
    user_id: int
    title: str
    brand: str
    image_url: Optional[str] = None
    shop_url: Optional[str] = None
    target_price: float
    current_price: Optional[float] = None
    category: ItemCategory
    status: ItemStatus = ItemStatus.ACTIVE
    completed_at: Optional[datetime] = None
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PriceHistoryOut(BaseModel):
    id: int
    item_id: int
    price: float
    checked_at: datetime

    class Config:
        from_attributes = True


class TelegramLinkRequest(BaseModel):
    code: str


class TelegramLinkResponse(BaseModel):
    success: bool
    message: str
