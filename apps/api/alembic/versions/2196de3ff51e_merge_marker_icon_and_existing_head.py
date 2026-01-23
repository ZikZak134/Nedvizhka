"""merge marker_icon and existing head

Revision ID: 2196de3ff51e
Revises: 2f3d8eb2b247, b2c3d4e5f6g7
Create Date: 2026-01-23 13:38:53.094459

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2196de3ff51e'
down_revision: Union[str, Sequence[str], None] = ('2f3d8eb2b247', 'b2c3d4e5f6g7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
