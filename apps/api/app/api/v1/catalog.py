from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.admin_guard import require_admin
from app.db.deps import get_db
from app.models.barber import Barber
from app.models.service import Service
from app.models.setting import Setting
from app.schemas.service import ServiceOut, ServiceUpdate
from app.schemas.setting import SettingOut, SettingUpdate

router = APIRouter()


@router.get("/barbers")
def list_barbers(db: Session = Depends(get_db)):
    rows = (
        db.query(Barber)
        .filter(Barber.active == True)  # noqa: E712
        .order_by(Barber.name.asc())
        .all()
    )
    return [{"id": str(r.id), "name": r.name} for r in rows]


@router.get("/services", response_model=list[ServiceOut])
def list_services(db: Session = Depends(get_db)):
    return (
        db.query(Service)
        .filter(Service.active == True)  # noqa: E712
        .order_by(Service.duration_minutes.asc(), Service.name.asc())
        .all()
    )


@router.patch("/services/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: UUID,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(service, k, v)

    db.add(service)
    db.commit()
    db.refresh(service)
    return service


# -------------------------
# SETTINGS (pública + admin)
# -------------------------

def _get_or_create_settings(db: Session) -> Setting:
    s = db.query(Setting).filter(Setting.id == "main").first()
    if not s:
        s = Setting(id="main")
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("/settings", response_model=SettingOut)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create_settings(db)


@router.patch("/settings", response_model=SettingOut, dependencies=[Depends(require_admin)])
def update_settings(payload: SettingUpdate, db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(s, k, v)

    db.add(s)
    db.commit()
    db.refresh(s)
    return s
