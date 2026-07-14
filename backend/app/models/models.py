import enum
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Integer, Float, Text, Enum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ItemCategory(str, enum.Enum):
    BUY_NOW = "BUY_NOW"
    SAVE_UP = "SAVE_UP"
    FUTURE_DROP = "FUTURE_DROP"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(default=False)
    telegram_chat_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    telegram_link_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.username}>"


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), default="")
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    shop_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    target_price: Mapped[float] = mapped_column(Float, default=0.0)
    current_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    category: Mapped[ItemCategory] = mapped_column(
        Enum(ItemCategory, name="item_category"), default=ItemCategory.SAVE_UP
    )
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="items")
    price_history = relationship("PriceHistory", back_populates="item", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<WishlistItem {self.title}>"


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("wishlist_items.id", ondelete="CASCADE"), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    item = relationship("WishlistItem", back_populates="price_history")

    def __repr__(self) -> str:
        return f"<PriceHistory {self.item_id} @ {self.price}>"
