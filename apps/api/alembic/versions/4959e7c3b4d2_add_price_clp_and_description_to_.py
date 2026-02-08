"""add price_clp and description to services

Revision ID: 4959e7c3b4d2
Revises: bc4b807b178b
"""
from typing import Sequence, Union

from alembic import op

revision: str = "4959e7c3b4d2"
down_revision: Union[str, Sequence[str], None] = "bc4b807b178b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ✅ Si services no existe, créala mínimo
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS services (
            id UUID PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            duration_minutes INTEGER NOT NULL,
            active BOOLEAN NOT NULL DEFAULT TRUE
        );
        """
    )

    # ✅ Agrega columnas sin fallar si ya existen
    op.execute("ALTER TABLE services ADD COLUMN IF NOT EXISTS price_clp INTEGER NOT NULL DEFAULT 0;")
    op.execute("ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;")


def downgrade() -> None:
    # safe
    op.execute("ALTER TABLE services DROP COLUMN IF EXISTS description;")
    op.execute("ALTER TABLE services DROP COLUMN IF EXISTS price_clp;")
