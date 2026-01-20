"""add range fields and price_per_sqm to properties

Revision ID: 7d8e9f1a2b3c
Revises: 516b453f2beb
Create Date: 2026-01-20 16:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d8e9f1a2b3c'
down_revision: Union[str, None] = '516b453f2beb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add range fields and price_per_sqm for Complex (ЖК) support."""
    # Add price per square meter
    op.add_column('properties', sa.Column('price_per_sqm', sa.Float(), nullable=True))
    
    # Add area range
    op.add_column('properties', sa.Column('area_min', sa.Float(), nullable=True))
    op.add_column('properties', sa.Column('area_max', sa.Float(), nullable=True))
    
    # Add rooms range
    op.add_column('properties', sa.Column('rooms_min', sa.Integer(), nullable=True))
    op.add_column('properties', sa.Column('rooms_max', sa.Integer(), nullable=True))
    
    # Add floor range
    op.add_column('properties', sa.Column('floor_min', sa.Integer(), nullable=True))
    op.add_column('properties', sa.Column('floor_max', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Remove range fields and price_per_sqm."""
    op.drop_column('properties', 'floor_max')
    op.drop_column('properties', 'floor_min')
    op.drop_column('properties', 'rooms_max')
    op.drop_column('properties', 'rooms_min')
    op.drop_column('properties', 'area_max')
    op.drop_column('properties', 'area_min')
    op.drop_column('properties', 'price_per_sqm')
