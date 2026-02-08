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
    # ✅ IMPORTANTE: settings debe CREARSE en upgrade (no borrarse)
    op.create_table(
        "settings",
        sa.Column("id", sa.VARCHAR(length=20), nullable=False),
        sa.Column("address", sa.VARCHAR(length=255), nullable=False),
        sa.Column("whatsapp", sa.VARCHAR(length=50), nullable=False),
        sa.Column("instagram_url", sa.VARCHAR(length=255), nullable=False),
        sa.Column("tiktok_url", sa.VARCHAR(length=255), nullable=False),
        sa.Column("hours_week", sa.VARCHAR(length=80), nullable=False),
        sa.Column("hours_sat", sa.VARCHAR(length=80), nullable=False),
        sa.Column("hours_sun", sa.VARCHAR(length=80), nullable=False),
        sa.Column("google_maps_embed_url", sa.TEXT(), nullable=False),
        sa.Column("featured_rating", sa.DOUBLE_PRECISION(precision=53), nullable=True),
        sa.Column("featured_reviews_count", sa.INTEGER(), nullable=True),
        sa.Column(
            "featured_reviews",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("settings_pkey")),
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

    # ✅ En downgrade se BORRA settings (no se crea)
    op.drop_table("settings")
