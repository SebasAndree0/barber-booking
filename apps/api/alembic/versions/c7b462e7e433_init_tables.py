"""init tables

Revision ID: c7b462e7e433
Revises: 21887d1bb929
Create Date: 2026-02-08 10:56:12.006468

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "c7b462e7e433"
down_revision: Union[str, Sequence[str], None] = "21887d1bb929"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ✅ SAFE: si settings ya existe (por migraciones previas), no falla
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS settings (
            id VARCHAR(20) PRIMARY KEY,
            address VARCHAR(255) NOT NULL,
            whatsapp VARCHAR(50) NOT NULL,
            instagram_url VARCHAR(255) NOT NULL,
            tiktok_url VARCHAR(255) NOT NULL,
            hours_week VARCHAR(80) NOT NULL,
            hours_sat VARCHAR(80) NOT NULL,
            hours_sun VARCHAR(80) NOT NULL,
            google_maps_embed_url TEXT NOT NULL,
            featured_rating DOUBLE PRECISION,
            featured_reviews_count INTEGER,
            featured_reviews JSONB
        );
        """
    )

    # índices / alter columns que ya tenías
    op.create_index(op.f("ix_barbers_active"), "barbers", ["active"], unique=False)

    op.alter_column(
        "bookings",
        "client_email",
        existing_type=sa.TEXT(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )

    op.alter_column(
        "bookings",
        "end_time",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
    )

    op.create_index(op.f("ix_bookings_barber_id"), "bookings", ["barber_id"], unique=False)
    op.create_index(op.f("ix_bookings_client_email"), "bookings", ["client_email"], unique=False)
    op.create_index(op.f("ix_bookings_service_id"), "bookings", ["service_id"], unique=False)
    op.create_index(op.f("ix_bookings_start_time"), "bookings", ["start_time"], unique=False)

    op.create_index(op.f("ix_services_active"), "services", ["active"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_services_active"), table_name="services")
    op.drop_index(op.f("ix_bookings_start_time"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_service_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_client_email"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_barber_id"), table_name="bookings")

    op.alter_column(
        "bookings",
        "end_time",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
    )

    op.alter_column(
        "bookings",
        "client_email",
        existing_type=sa.String(length=255),
        type_=sa.TEXT(),
        existing_nullable=True,
    )

    op.drop_index(op.f("ix_barbers_active"), table_name="barbers")

    # ✅ SAFE
    op.execute("DROP TABLE IF EXISTS settings;")
