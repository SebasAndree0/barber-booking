from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ServiceOut(BaseModel):
    id: UUID
    name: str
    duration_minutes: int
    active: bool
    price_clp: int
    description: Optional[str] = None

    class Config:
        from_attributes = True  # Pydantic v2


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    duration_minutes: Optional[int] = Field(default=None, ge=5, le=240)
    price_clp: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = Field(default=None, max_length=500)
    active: Optional[bool] = None

    class Config:
        from_attributes = True  # no es obligatorio aquí, pero no molesta
