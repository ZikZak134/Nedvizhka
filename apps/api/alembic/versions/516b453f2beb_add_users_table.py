"""add users table

Revision ID: 516b453f2beb
Revises: b28f67a5ca5a
Create Date: 2026-01-14 12:25:14.506844

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '516b453f2beb'
down_revision: Union[str, Sequence[str], None] = 'b28f67a5ca5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('username', sa.String(50), unique=True, index=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('role', sa.String(20), nullable=False, server_default='admin'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('last_login', sa.DateTime, nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('users')
