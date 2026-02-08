"""add featured reviews columns

Revision ID: 21887d1bb929
Revises: 537868564f36
"""
from typing import Sequence, Union

from alembic import op

revision: str = "21887d1bb929"
down_revision: Union[str, Sequence[str], None] = "537868564f36"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ✅ Si settings no existe, créala mínima
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS settings (
            id VARCHAR(20) PRIMARY KEY
        );
        """
    )

    # ✅ Agrega columnas sin fallar si ya existen
    op.execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS featured_rating FLOAT;")
    op.execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS featured_reviews_count INTEGER;")
    op.execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS featured_reviews JSONB;")


def downgrade() -> None:
    # safe
    op.execute("ALTER TABLE settings DROP COLUMN IF EXISTS featured_reviews;")
    op.execute("ALTER TABLE settings DROP COLUMN IF EXISTS featured_reviews_count;")
    op.execute("ALTER TABLE settings DROP COLUMN IF EXISTS featured_rating;")
