import uuid
from sqlalchemy import Column, Boolean, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    duration_minutes = Column(Integer, nullable=False)

    price_clp = Column(Integer, nullable=False, server_default=text("0"))
    description = Column(Text, nullable=True)

    active = Column(Boolean, nullable=False, server_default=text("true"), index=True)
