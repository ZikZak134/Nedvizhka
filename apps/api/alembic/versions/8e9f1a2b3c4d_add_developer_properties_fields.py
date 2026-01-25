"""add developer properties fields

Revision ID: 8e9f1a2b3c4d
Revises: 7d8e9f1a2b3c
Create Date: 2026-01-23 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e9f1a2b3c4d'
down_revision: Union[str, None] = '7d8e9f1a2b3c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add Developer Properties (Новостройки) fields."""
    # Property type
    op.add_column('properties', sa.Column('property_type', sa.String(), nullable=True, server_default='apartment'))
    
    # Layout & Finishing
    op.add_column('properties', sa.Column('layout_type', sa.String(), nullable=True))
    op.add_column('properties', sa.Column('finishing_type', sa.String(), nullable=True))
    op.add_column('properties', sa.Column('completion_date', sa.String(), nullable=True))
    
    # Developer info
    op.add_column('properties', sa.Column('is_from_developer', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('properties', sa.Column('developer_name', sa.String(), nullable=True))
    op.add_column('properties', sa.Column('developer_comment', sa.String(), nullable=True))
    
    # Custom fields & Complex relation
    op.add_column('properties', sa.Column('custom_fields', sa.JSON(), nullable=True, server_default='{}'))
    op.add_column('properties', sa.Column('complex_id', sa.Integer(), nullable=True))
    
    op.create_index('idx_property_complex', 'properties', ['complex_id'])

    # Create complexes table (Missing migration fix)
    op.create_table(
        'complexes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('center_lat', sa.Float(), nullable=False),
        sa.Column('center_lng', sa.Float(), nullable=False),
        sa.Column('growth', sa.Float(), nullable=True),
        sa.Column('price_sqm', sa.Integer(), nullable=True),
        sa.Column('min_price', sa.Integer(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('image', sa.String(length=500), nullable=True),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('district', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_complexes_id'), 'complexes', ['id'], unique=False)
    op.create_index(op.f('ix_complexes_name'), 'complexes', ['name'], unique=True)


def downgrade() -> None:
    """Remove Developer Properties fields."""
    op.drop_table('complexes')
    op.drop_index('idx_property_complex', table_name='properties')
    op.drop_column('properties', 'complex_id')
    op.drop_column('properties', 'custom_fields')
    op.drop_column('properties', 'developer_comment')
    op.drop_column('properties', 'developer_name')
    op.drop_column('properties', 'is_from_developer')
    op.drop_column('properties', 'completion_date')
    op.drop_column('properties', 'finishing_type')
    op.drop_column('properties', 'layout_type')
    op.drop_column('properties', 'property_type')
