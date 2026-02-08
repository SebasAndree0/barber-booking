"""add featured reviews to settings

Revision ID: 537868564f36
Revises: 4959e7c3b4d2
Create Date: 2026-02-XX
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
    # ✅ Si settings no existe, créala (mínimo) para no reventar el deploy
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS settings (
            id VARCHAR(20) PRIMARY KEY
        );
        """
    )

    # ✅ Asegura columnas (si ya existen, no falla)
    op.execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS featured_rating FLOAT;")
    op.execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS featured_reviews_count INTEGER;")
    op.execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS featured_reviews JSONB;")


def downgrade() -> None:
    # No es crítico en Render, pero lo dejamos ordenado
    op.execute("ALTER TABLE settings DROP COLUMN IF EXISTS featured_reviews;")
    op.execute("ALTER TABLE settings DROP COLUMN IF EXISTS featured_reviews_count;")
    op.execute("ALTER TABLE settings DROP COLUMN IF EXISTS featured_rating;")
