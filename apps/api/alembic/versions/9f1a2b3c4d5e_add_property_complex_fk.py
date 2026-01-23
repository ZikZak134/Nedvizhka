"""add property complex fk

Revision ID: 9f1a2b3c4d5e
Revises: 8e9f1a2b3c4d
Create Date: 2026-01-23 10:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f1a2b3c4d5e'
down_revision: Union[str, None] = '8e9f1a2b3c4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add ForeignKey constraint for complex_id."""
    with op.batch_alter_table('properties', schema=None) as batch_op:
        batch_op.create_foreign_key(
            'fk_property_complex',
            'complexes',
            ['complex_id'],
            ['id']
        )


def downgrade() -> None:
    """Remove ForeignKey constraint."""
    with op.batch_alter_table('properties', schema=None) as batch_op:
        batch_op.drop_constraint('fk_property_complex', type_='foreignkey')
