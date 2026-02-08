"""add featured reviews to settings

Revision ID: 537868564f36
Revises: 4959e7c3b4d2
Create Date: 2026-02-07 15:10:14.812127
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "537868564f36"
down_revision: Union[str, Sequence[str], None] = "4959e7c3b4d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ✅ NUEVO: reseñas manuales
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
