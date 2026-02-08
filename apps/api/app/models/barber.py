import uuid
from sqlalchemy import Column, Boolean, String
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Barber(Base):
    __tablename__ = "barbers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    active = Column(Boolean, nullable=False, default=True)
