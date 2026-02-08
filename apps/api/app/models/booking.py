import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    barber_id = Column(UUID(as_uuid=True), ForeignKey("barbers.id"), nullable=False, index=True)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=False, index=True)

    client_name = Column(String(120), nullable=False)
    client_phone = Column(String(30), nullable=True)
    client_email = Column(String(255), nullable=True, index=True)

    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)  # cámbialo a False cuando lo tengas calculado

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
