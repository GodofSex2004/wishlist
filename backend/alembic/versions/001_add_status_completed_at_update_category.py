"""add status completed_at update category

Revision ID: 001
Revises:
Create Date: 2026-07-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("wishlist_items", sa.Column("status", sa.String(20), server_default="ACTIVE", nullable=False))
    op.add_column("wishlist_items", sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True))

    op.alter_column("wishlist_items", "category",
                    type_=sa.String(20),
                    postgresql_using="category::text")

    op.execute("DROP TYPE IF EXISTS item_category")


def downgrade() -> None:
    op.execute("CREATE TYPE item_category AS ENUM ('BUY_NOW', 'SAVE_UP', 'FUTURE_DROP')")
    op.alter_column("wishlist_items", "category",
                    type_=postgresql.ENUM("BUY_NOW", "SAVE_UP", "FUTURE_DROP", name="item_category"),
                    postgresql_using="category::item_category")
    op.drop_column("wishlist_items", "completed_at")
    op.drop_column("wishlist_items", "status")
