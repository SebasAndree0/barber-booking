from __future__ import annotations

from datetime import datetime, timedelta, date, time, timezone
from typing import List, Dict, Optional, Any
from uuid import UUID
import os

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, not_
from sqlalchemy.exc import IntegrityError

from zoneinfo import ZoneInfo

from app.db.deps import get_db
from app.models.booking import Booking
from app.models.service import Service
from app.schemas.booking import BookingCreate
from app.schemas.booking_bulk import BookingBulkCreate
from app.core.mailer import send_email  # ✅ si no lo usas, bórralo

router = APIRouter()

CL_TZ = ZoneInfo("America/Santiago")
UTC = timezone.utc

ACTIVE_STATUSES = ["CONFIRMED", "PENDING", "ACTIVE"]
CANCEL_MINUTES_BEFORE = 30


def _overlaps(a_start: datetime, a_end: datetime, b_start: datetime, b_end: datetime) -> bool:
    return not (a_end <= b_start or a_start >= b_end)


def _to_utc(dt: datetime) -> datetime:
    """Convierte datetime a UTC. Si viene naive, asume Chile."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=CL_TZ)
    return dt.astimezone(UTC)


def _service_minutes_or_default(service: Service) -> int:
    # Si después quieres usar duración real:
    # return int(getattr(service, "duration_minutes", 60) or 60)
    return 60


def _is_active_status(status: Optional[str]) -> bool:
    return (status or "").upper() in ACTIVE_STATUSES


def _as_cl_iso(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(CL_TZ).isoformat()


def _as_utc_iso(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=CL_TZ)
    return dt.astimezone(UTC).isoformat()


def _norm_name(s: Optional[str]) -> str:
    """Normaliza: trim + colapsa espacios + lower. Sirve para validar dueño por nombre."""
    return " ".join((s or "").strip().split()).lower()


@router.post("/bookings")
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    # ✅ Ya NO exigimos WhatsApp/correo
    phone = (payload.client_phone or "").strip()
    email = (str(getattr(payload, "client_email", "") or "")).strip()  # queda opcional

    # ids
    try:
        service_uuid: UUID = payload.service_id if isinstance(payload.service_id, UUID) else UUID(str(payload.service_id))
        barber_uuid: UUID = payload.barber_id if isinstance(payload.barber_id, UUID) else UUID(str(payload.barber_id))
    except Exception:
        raise HTTPException(status_code=422, detail="barber_id y service_id deben ser UUID válidos")

    service = db.query(Service).filter(Service.id == service_uuid).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no existe")

    start = _to_utc(payload.start_time)

    # Solo en punto (validación en horario Chile)
    start_cl = start.astimezone(CL_TZ)
    if start_cl.minute != 0 or start_cl.second != 0:
        raise HTTPException(status_code=400, detail="Selecciona una hora válida (solo horas en punto).")

    minutes = _service_minutes_or_default(service)
    end = start + timedelta(minutes=minutes)

    conflict = (
        db.query(Booking)
        .filter(
            Booking.barber_id == barber_uuid,
            Booking.status.in_(ACTIVE_STATUSES),
            not_(
                or_(
                    Booking.end_time <= start,
                    Booking.start_time >= end,
                )
            ),
        )
        .first()
    )

    if conflict:
        raise HTTPException(status_code=409, detail="Horario no disponible")

    booking = Booking(
        barber_id=barber_uuid,
        service_id=service_uuid,
        client_name=payload.client_name,
        client_phone=phone or None,
        client_email=email or None,
        start_time=start,
        end_time=end,
        status="CONFIRMED",
    )

    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Hora ya tomada. Elige otra.")

    # Email confirmación (si hay email)
    if booking.client_email:
        BUSINESS_EMAIL = os.getenv("BUSINESS_EMAIL", "osobarberr@gmail.com")
        BUSINESS_WA = os.getenv("BUSINESS_WA", "+569 2942 9715")
        subject = "Reserva confirmada — OsoBarber"

        booking_cl = booking.start_time.astimezone(CL_TZ)

        text = (
            f"Hola {booking.client_name} 👋\n\n"
            f"Gracias por agendar con OsoBarber. Tu reserva quedó confirmada ✅\n\n"
            f"• Servicio: {service.name}\n"
            f"• Día: {booking_cl.date()}\n"
            f"• Hora: {booking_cl.strftime('%H:%M')} (Chile)\n\n"
            f"Si necesitas cambiar o cancelar, entra a la app o escríbenos:\n"
            f"📧 {BUSINESS_EMAIL}\n"
            f"📱 {BUSINESS_WA}\n\n"
            f"OsoBarber • San Bernardo"
        )

        try:
            send_email(booking.client_email, subject, text)
        except Exception as e:
            print("❌ Error enviando email:", repr(e))

    # ✅ DEVOLVER EN CHILE (para que el front NO se confunda)
    return {
        "id": str(booking.id),
        "barber_id": str(booking.barber_id),
        "service_id": str(booking.service_id),
        "client_name": booking.client_name,
        "client_phone": booking.client_phone,
        "client_email": booking.client_email,
        "start_time": _as_cl_iso(booking.start_time),
        "end_time": _as_cl_iso(booking.end_time),
        "status": booking.status,
    }


@router.post("/bookings/bulk")
def create_bookings_bulk(payload: BookingBulkCreate, db: Session = Depends(get_db)):
    # ✅ email opcional (no obligatorio)
    email = (str(getattr(payload, "client_email", "") or "")).strip()

    service = db.query(Service).filter(Service.id == payload.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no existe")

    minutes = _service_minutes_or_default(service)
    duration = timedelta(minutes=minutes)

    starts_utc: List[datetime] = []
    for st in payload.start_times:
        st_utc = _to_utc(st)
        st_cl = st_utc.astimezone(CL_TZ)
        if st_cl.minute != 0 or st_cl.second != 0:
            raise HTTPException(status_code=400, detail="Selecciona horas válidas (solo en punto).")
        starts_utc.append(st_utc)

    starts_utc = sorted(set(starts_utc))
    if len(starts_utc) == 0:
        raise HTTPException(status_code=400, detail="Selecciona al menos 1 hora.")

    ranges = [(st, st + duration) for st in starts_utc]

    global_start = min(st for st, _ in ranges)
    global_end = max(en for _, en in ranges)

    existing_all = (
        db.query(Booking)
        .filter(
            Booking.barber_id == payload.barber_id,
            Booking.start_time < global_end,
            Booking.end_time > global_start,
        )
        .all()
    )
    existing = [b for b in existing_all if _is_active_status(getattr(b, "status", None))]

    for slot_start, slot_end in ranges:
        busy = any(_overlaps(slot_start, slot_end, b.start_time, b.end_time) for b in existing)
        if busy:
            raise HTTPException(status_code=409, detail="Una de las horas ya está ocupada. Elige otras.")

    created_ids: List[str] = []
    try:
        for slot_start, slot_end in ranges:
            booking = Booking(
                barber_id=payload.barber_id,
                service_id=payload.service_id,
                client_name=payload.client_name,
                client_phone=None,
                client_email=email or None,
                start_time=slot_start,
                end_time=slot_end,
                status="CONFIRMED",
            )
            db.add(booking)

        db.commit()

        # ✅ ya no dependemos del email: buscamos por barber + name + rango
        created = (
            db.query(Booking)
            .filter(
                Booking.barber_id == payload.barber_id,
                Booking.client_name == payload.client_name,
                Booking.start_time >= global_start,
                Booking.start_time < global_end,
            )
            .order_by(Booking.start_time.asc())
            .all()
        )

        created_ids = [str(b.id) for b in created if _is_active_status(getattr(b, "status", None))]

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Hora ya tomada. Elige otra.")
    except Exception:
        db.rollback()
        raise

    return {"ids": created_ids}


# ✅ REAGENDAR (EDITAR START_TIME) CON DUEÑO POR NOMBRE+APELLIDO
@router.patch("/bookings/{booking_id}")
def reschedule_booking(
    booking_id: UUID,
    name: str = Query(..., description="Nombre y apellido del dueño de la reserva"),
    new_start_time: datetime = Query(..., description="Nueva fecha/hora (ISO). Se interpreta Chile si viene naive"),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no existe")

    req_name = _norm_name(name)
    owner_name = _norm_name(booking.client_name)

    if not owner_name:
        raise HTTPException(status_code=400, detail="Esta reserva no tiene nombre asociado")
    if owner_name != req_name:
        raise HTTPException(status_code=403, detail="No autorizado")

    if (booking.status or "").upper() == "CANCELLED":
        raise HTTPException(status_code=400, detail="No puedes reagendar una reserva cancelada")

    now_utc = datetime.now(tz=UTC)
    if booking.start_time <= now_utc:
        raise HTTPException(status_code=400, detail="No puedes reagendar una reserva pasada")

    if booking.start_time - now_utc < timedelta(minutes=CANCEL_MINUTES_BEFORE):
        raise HTTPException(
            status_code=400,
            detail=f"No puedes reagendar con menos de {CANCEL_MINUTES_BEFORE} minutos de anticipación",
        )

    service = db.query(Service).filter(Service.id == booking.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no existe")

    new_start_utc = _to_utc(new_start_time)
    new_start_cl = new_start_utc.astimezone(CL_TZ)
    if new_start_cl.minute != 0 or new_start_cl.second != 0:
        raise HTTPException(status_code=400, detail="Selecciona una hora válida (solo horas en punto).")

    minutes = _service_minutes_or_default(service)
    new_end_utc = new_start_utc + timedelta(minutes=minutes)

    conflict = (
        db.query(Booking)
        .filter(
            Booking.barber_id == booking.barber_id,
            Booking.id != booking.id,
            Booking.status.in_(ACTIVE_STATUSES),
            not_(
                or_(
                    Booking.end_time <= new_start_utc,
                    Booking.start_time >= new_end_utc,
                )
            ),
        )
        .first()
    )
    if conflict:
        raise HTTPException(status_code=409, detail="Horario no disponible")

    booking.start_time = new_start_utc
    booking.end_time = new_end_utc
    booking.status = "CONFIRMED"

    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Hora ya tomada. Elige otra.")

    return {
        "ok": True,
        "id": str(booking.id),
        "start_time": _as_cl_iso(booking.start_time),
        "end_time": _as_cl_iso(booking.end_time),
        "status": (booking.status or "").upper(),
    }


@router.post("/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: UUID,
    name: str = Query(..., description="Nombre y apellido del dueño de la reserva"),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no existe")

    req_name = _norm_name(name)
    owner_name = _norm_name(booking.client_name)

    if not owner_name:
        raise HTTPException(status_code=400, detail="Esta reserva no tiene nombre asociado")
    if owner_name != req_name:
        raise HTTPException(status_code=403, detail="No autorizado")

    if (booking.status or "").upper() == "CANCELLED":
        return {"ok": True, "status": "CANCELLED", "cancelled_at": _as_cl_iso(booking.cancelled_at)}

    now_utc = datetime.now(tz=UTC)

    if booking.start_time <= now_utc:
        raise HTTPException(status_code=400, detail="No puedes cancelar una reserva pasada")

    if booking.start_time - now_utc < timedelta(minutes=CANCEL_MINUTES_BEFORE):
        raise HTTPException(
            status_code=400,
            detail=f"No puedes cancelar con menos de {CANCEL_MINUTES_BEFORE} minutos de anticipación",
        )

    booking.status = "CANCELLED"
    booking.cancelled_at = now_utc

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {"ok": True, "status": (booking.status or "").upper(), "cancelled_at": _as_cl_iso(booking.cancelled_at)}


@router.get("/bookings/my")
def list_my_bookings(
    name: str = Query(..., description="Nombre y apellido"),
    include_cancelled: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    norm = _norm_name(name)
    if len(norm) < 4 or " " not in norm:
        raise HTTPException(status_code=400, detail="Envía name con Nombre y Apellido")

    # ✅ Lo hacemos en Python para evitar dramas de colación/acentos entre DBs.
    rows = (
        db.query(Booking)
        .order_by(Booking.start_time.desc())
        .limit(500)
        .all()
    )

    matched = [b for b in rows if _norm_name(getattr(b, "client_name", None)) == norm]

    out = []
    for b in matched:
        status_up = (b.status or "").upper()
        is_active = status_up in ACTIVE_STATUSES
        if not include_cancelled and not is_active:
            continue

        out.append(
            {
                "id": str(b.id),
                "barber_id": str(b.barber_id),
                "service_id": str(b.service_id),
                "client_name": b.client_name,
                "client_phone": b.client_phone,
                "client_email": getattr(b, "client_email", None),
                "start_time": _as_cl_iso(b.start_time),
                "end_time": _as_cl_iso(b.end_time),
                "status": status_up or b.status,
                "cancelled_at": _as_cl_iso(b.cancelled_at),
            }
        )

    return out


@router.get("/bookings")
def list_bookings(
    barber_id: UUID = Query(..., description="UUID del barbero"),
    day: date = Query(..., description="YYYY-MM-DD (día en Chile)"),
    include_cancelled: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    day_start_cl = datetime.combine(day, time(0, 0, 0), tzinfo=CL_TZ)
    day_end_cl = day_start_cl + timedelta(days=1)

    day_start = day_start_cl.astimezone(UTC)
    day_end = day_end_cl.astimezone(UTC)

    rows = (
        db.query(Booking)
        .filter(
            Booking.barber_id == barber_id,
            Booking.start_time >= day_start,
            Booking.start_time < day_end,
        )
        .order_by(Booking.start_time.asc())
        .all()
    )

    out = []
    for b in rows:
        status_up = (b.status or "").upper()
        is_active = status_up in ACTIVE_STATUSES
        if not include_cancelled and not is_active:
            continue

        out.append(
            {
                "id": str(b.id),
                "barber_id": str(b.barber_id),
                "service_id": str(b.service_id),
                "client_name": b.client_name,
                "client_phone": b.client_phone,
                "client_email": getattr(b, "client_email", None),
                "start_time": _as_cl_iso(b.start_time),
                "end_time": _as_cl_iso(b.end_time),
                "status": status_up or b.status,
                "cancelled_at": _as_cl_iso(b.cancelled_at),
            }
        )

    return out


@router.get("/slots")
def list_slots(
    barber_id: UUID = Query(..., description="UUID del barbero"),
    service_id: UUID = Query(..., description="UUID del servicio"),
    day: date = Query(..., description="YYYY-MM-DD (día Chile)"),
    include_unavailable: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no existe")

    minutes = _service_minutes_or_default(service)
    duration = timedelta(minutes=minutes)

    HOURS = {
        0: (time(19, 0), time(22, 0)),
        1: (time(19, 0), time(22, 0)),
        2: (time(19, 0), time(22, 0)),
        3: (time(19, 0), time(22, 0)),
        4: (time(19, 0), time(22, 0)),
        5: (time(10, 0), time(22, 0)),
        6: (time(10, 0), time(21, 0)),
    }

    rule = HOURS.get(day.weekday())
    if not rule:
        return []

    WORK_START, WORK_END = rule
    STEP = timedelta(hours=1)

    start_day_cl = datetime.combine(day, WORK_START, tzinfo=CL_TZ)

    # Deja ver el último inicio WORK_END
    end_day_cl = datetime.combine(day, WORK_END, tzinfo=CL_TZ) + timedelta(hours=1)

    start_day = start_day_cl.astimezone(UTC)
    end_day = end_day_cl.astimezone(UTC)

    existing_all = (
        db.query(Booking)
        .filter(
            Booking.barber_id == barber_id,
            Booking.start_time < end_day,
            Booking.end_time > start_day,
        )
        .all()
    )
    existing = [b for b in existing_all if _is_active_status(getattr(b, "status", None))]

    slots: List[Dict[str, Any]] = []
    cursor = start_day

    while cursor + duration <= end_day:
        slot_start = cursor
        slot_end = cursor + duration

        busy = any(_overlaps(slot_start, slot_end, b.start_time, b.end_time) for b in existing)
        available = not busy

        if include_unavailable or available:
            slots.append(
                {
                    "start_time": slot_start.astimezone(CL_TZ).isoformat(),
                    "end_time": slot_end.astimezone(CL_TZ).isoformat(),
                    "available": available,
                }
            )

        cursor += STEP

    return slots
