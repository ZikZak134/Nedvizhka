"""add videos field to properties

Revision ID: a1b2c3d4e5f6
Revises: 9f1a2b3c4d5e
Create Date: 2026-01-23 11:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '9f1a2b3c4d5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add videos field to properties table."""
    op.add_column('properties', sa.Column('videos', sa.JSON(), nullable=True, server_default='[]'))


def downgrade() -> None:
    """Remove videos field."""
    op.drop_column('properties', 'videos')
