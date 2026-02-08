"""add price_clp and description to services

Revision ID: 4959e7c3b4d2
Revises: bc4b807b178b
Create Date: 2026-02-06 23:05:19.954619
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4959e7c3b4d2"
down_revision: Union[str, Sequence[str], None] = "bc4b807b178b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "services",
        sa.Column("price_clp", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "services",
        sa.Column("description", sa.Text(), nullable=True),
    )

    # opcional: quitar default después
    op.alter_column("services", "price_clp", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("services", "description")
    op.drop_column("services", "price_clp")
