"""init tables

Revision ID: bc4b807b178b
Revises: <base>
Create Date: 2026-02-XX

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "bc4b807b178b"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ✅ Crear settings SI NO existe (evita el crash en Render)
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS settings (
            id VARCHAR(20) PRIMARY KEY,
            address VARCHAR(255) NOT NULL DEFAULT '',
            whatsapp VARCHAR(50) NOT NULL DEFAULT '',
            instagram_url VARCHAR(255) NOT NULL DEFAULT '',
            tiktok_url VARCHAR(255) NOT NULL DEFAULT '',
            hours_week VARCHAR(80) NOT NULL DEFAULT '',
            hours_sat VARCHAR(80) NOT NULL DEFAULT '',
            hours_sun VARCHAR(80) NOT NULL DEFAULT '',
            google_maps_embed_url TEXT NOT NULL DEFAULT '',
            featured_rating DOUBLE PRECISION NULL,
            featured_reviews_count INTEGER NULL,
            featured_reviews JSONB NULL
        );
        """
    )

    # ✅ (Opcional) insertar registro base si no existe
    op.execute(
        """
        INSERT INTO settings (id)
        VALUES ('main')
        ON CONFLICT (id) DO NOTHING;
        """
    )


def downgrade() -> None:
    op.drop_table("settings")
