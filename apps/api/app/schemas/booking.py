from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class BookingCreate(BaseModel):
    barber_id: UUID
    service_id: UUID
    client_name: str = Field(min_length=2, max_length=120)

    # ✅ El cliente puede dejar WhatsApp o Email (uno de los dos)
    client_phone: Optional[str] = Field(default=None, min_length=6, max_length=30)
    client_email: Optional[EmailStr] = None

    start_time: datetime
