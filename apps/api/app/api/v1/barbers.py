from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.admin_guard import require_admin
from app.db.session import get_db
from app.models.barber import Barber

router = APIRouter(prefix="/barbers", tags=["barbers"])


class BarberCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)


class BarberUpdate(BaseModel):
    active: bool


@router.get("")
def list_barbers(db: Session = Depends(get_db)):
    # Solo barberos activos para que se “saquen” ocultándolos
    return (
        db.query(Barber)
        .filter(Barber.active == True)
        .order_by(Barber.name)
        .all()
    )


@router.post("", dependencies=[Depends(require_admin)])
def create_barber(payload: BarberCreate, db: Session = Depends(get_db)):
    b = Barber(name=payload.name, active=True)
    db.add(b)
    db.commit()
    db.refresh(b)
    return b


@router.patch("/{barber_id}", dependencies=[Depends(require_admin)])
def update_barber(barber_id: str, payload: BarberUpdate, db: Session = Depends(get_db)):
    b = db.query(Barber).filter(Barber.id == barber_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Barber not found")

    b.active = payload.active
    db.commit()
    db.refresh(b)
    return b
