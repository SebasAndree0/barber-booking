"""add featured reviews columns

Revision ID: 21887d1bb929
Revises: 537868564f36
Create Date: 2026-02-07 15:20:10.585740

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '21887d1bb929'
down_revision: Union[str, Sequence[str], None] = '537868564f36'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("settings", sa.Column("featured_rating", sa.Float(), nullable=True))
    op.add_column("settings", sa.Column("featured_reviews_count", sa.Integer(), nullable=True))
    op.add_column(
        "settings",
        sa.Column("featured_reviews", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )

def downgrade() -> None:
    op.drop_column("settings", "featured_reviews")
    op.drop_column("settings", "featured_reviews_count")
    op.drop_column("settings", "featured_rating")
