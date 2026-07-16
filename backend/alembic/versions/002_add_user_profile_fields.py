"""add user profile fields

Revision ID: 002
Revises: 001
Create Date: 2026-07-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("display_name", sa.String(100), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(500), nullable=True))
    op.add_column("users", sa.Column("is_private", sa.Boolean(), server_default="false", nullable=False))


def downgrade() -> None:
    op.drop_column("users", "is_private")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "display_name")
