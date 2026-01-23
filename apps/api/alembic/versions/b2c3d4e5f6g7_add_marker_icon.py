"""add marker_icon field

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-01-23 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add marker_icon field to properties table."""
    op.add_column('properties', sa.Column('marker_icon', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove marker_icon field."""
    op.drop_column('properties', 'marker_icon')
