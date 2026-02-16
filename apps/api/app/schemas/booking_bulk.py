from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, EmailStr


class BookingBulkCreate(BaseModel):
    barber_id: UUID
    service_id: UUID
    client_name: str = Field(min_length=2, max_length=120)
    client_email: Optional[EmailStr] = None
    start_times: List[datetime] = Field(min_length=1, description="Lista de horas (ISO 8601)")


class BookingBulkOut(BaseModel):
    ids: List[str]
