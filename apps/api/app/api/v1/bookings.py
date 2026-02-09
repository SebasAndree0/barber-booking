from __future__ import annotations

from datetime import datetime, timedelta, date, time, timezone
from typing import List, Dict, Optional
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
from app.core.mailer import send_email  # ✅ si no lo usas, bórralo

router = APIRouter()

CL_TZ = ZoneInfo("America/Santiago")
UTC = timezone.utc

ACTIVE_STATUSES = ["CONFIRMED", "PENDING"]


def _overlaps(a_start: datetime, a_end: datetime, b_start: datetime, b_end: datetime) -> bool:
    """True si [a_start, a_end) se cruza con [b_start, b_end)."""
    return not (a_end <= b_start or a_start >= b_end)


def _to_utc(dt: datetime) -> datetime:
    """Convierte datetime a UTC. Si viene naive, asume Chile."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=CL_TZ)
    return dt.astimezone(UTC)


@router.post("/bookings")
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    """
    Crea una reserva:
    - valida UUIDs (422)
    - valida que exista el servicio (404)
    - valida conflicto horario para el barbero (409)
    - calcula end_time según duration_minutes del servicio
    - valida contacto: WhatsApp o Email (uno de los dos)
    - si hay correo, envía confirmación automática
    - SOLO permite horas en punto (ej: 11:00, 12:00)
    """

    # ✅ Validación: debe venir WhatsApp o Email (uno de los dos)
    phone = (payload.client_phone or "").strip()
    email = (str(getattr(payload, "client_email", "") or "")).strip()

    if not phone and not email:
        raise HTTPException(status_code=400, detail="Ingresa WhatsApp o correo (uno de los dos).")

    # Soporta ambos casos: schema con UUID o schema con str.
    try:
        service_uuid: UUID = payload.service_id if isinstance(payload.service_id, UUID) else UUID(str(payload.service_id))
        barber_uuid: UUID = payload.barber_id if isinstance(payload.barber_id, UUID) else UUID(str(payload.barber_id))
    except Exception:
        raise HTTPException(status_code=422, detail="barber_id y service_id deben ser UUID válidos")

    service = db.query(Service).filter(Service.id == service_uuid).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no existe")

    start = _to_utc(payload.start_time)

    # ✅ Defensa: aunque el front muestre solo horas en punto,
    # esto evita reservas inválidas por requests manuales o bugs.
    start_cl = start.astimezone(CL_TZ)
    if start_cl.minute != 0 or start_cl.second != 0:
        raise HTTPException(status_code=400, detail="Selecciona una hora válida (solo horas en punto).")

    end = start + timedelta(minutes=service.duration_minutes)

    # ✅ Validación app-level (rápida): evita la mayoría de choques
    # ✅ IMPORTANTE: ignoramos CANCELLED
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

    # ✅ A PRUEBA DE DOBLE TOMA (race condition) — ahora lo cubre DB con bookings_no_overlap
    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Hora ya tomada. Elige otra.")

    # ✅ ENVÍO CORREO AUTOMÁTICO (si hay email)
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
            print("✅ Email enviado a:", booking.client_email)
        except Exception as e:
            print("❌ Error enviando email:", repr(e))

    return {
        "id": str(booking.id),
        "barber_id": str(booking.barber_id),
        "service_id": str(booking.service_id),
        "client_name": booking.client_name,
        "client_phone": booking.client_phone,
        "client_email": booking.client_email,
        "start_time": booking.start_time,
        "end_time": booking.end_time,
        "status": booking.status,
    }


@router.post("/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: UUID, db: Session = Depends(get_db)):
    """
    Cancela una reserva (no borra):
    - status -> CANCELLED
    - cancelled_at -> now()
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no existe")

    if booking.status == "CANCELLED":
        return {"ok": True, "status": "CANCELLED", "cancelled_at": booking.cancelled_at}

    now_utc = datetime.now(tz=UTC)

    # opcional: no permitir cancelar si ya empezó o pasó
    if booking.start_time <= now_utc:
        raise HTTPException(status_code=400, detail="No puedes cancelar una reserva pasada")

    booking.status = "CANCELLED"
    booking.cancelled_at = now_utc

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {"ok": True, "status": booking.status, "cancelled_at": booking.cancelled_at}


@router.get("/bookings/my")
def list_my_bookings(
    phone: Optional[str] = Query(default=None),
    email: Optional[str] = Query(default=None),
    include_cancelled: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """
    Devuelve reservas del cliente por phone o email.
    - Si include_cancelled=false (default) => solo activas (CONFIRMED/PENDING)
    """
    phone = (phone or "").strip()
    email = (email or "").strip()

    if not phone and not email:
        raise HTTPException(status_code=400, detail="Envía phone o email")

    q = db.query(Booking)

    if phone:
        q = q.filter(Booking.client_phone == phone)
    if email:
        q = q.filter(Booking.client_email == email)

    if not include_cancelled:
        q = q.filter(Booking.status.in_(ACTIVE_STATUSES))

    rows = q.order_by(Booking.start_time.desc()).limit(200).all()

    return [
        {
            "id": str(b.id),
            "barber_id": str(b.barber_id),
            "service_id": str(b.service_id),
            "client_name": b.client_name,
            "client_phone": b.client_phone,
            "client_email": b.client_email,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
            "cancelled_at": b.cancelled_at,
        }
        for b in rows
    ]


@router.get("/bookings")
def list_bookings(
    barber_id: UUID = Query(..., description="UUID del barbero"),
    day: date = Query(..., description="YYYY-MM-DD (día en Chile)"),
    include_cancelled: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """Lista reservas de un barbero para un día (día Chile -> UTC)."""

    day_start_cl = datetime.combine(day, time(0, 0, 0), tzinfo=CL_TZ)
    day_end_cl = day_start_cl + timedelta(days=1)

    day_start = day_start_cl.astimezone(UTC)
    day_end = day_end_cl.astimezone(UTC)

    q = (
        db.query(Booking)
        .filter(
            Booking.barber_id == barber_id,
            Booking.start_time >= day_start,
            Booking.start_time < day_end,
        )
        .order_by(Booking.start_time.asc())
    )

    if not include_cancelled:
        q = q.filter(Booking.status.in_(ACTIVE_STATUSES))

    rows = q.all()

    return [
        {
            "id": str(b.id),
            "barber_id": str(b.barber_id),
            "service_id": str(b.service_id),
            "client_name": b.client_name,
            "client_phone": b.client_phone,
            "client_email": getattr(b, "client_email", None),
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
            "cancelled_at": b.cancelled_at,
        }
        for b in rows
    ]


@router.get("/slots")
def list_slots(
    barber_id: UUID = Query(..., description="UUID del barbero"),
    service_id: UUID = Query(..., description="UUID del servicio"),
    day: date = Query(..., description="YYYY-MM-DD (día Chile)"),
    include_unavailable: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """
    Devuelve slots para un barbero + servicio en un día (día Chile).
    - Slots SOLO en punto: 10:00, 11:00, 12:00...
    - include_unavailable=true => devuelve TODOS con available true/false (para colores/tachado)
    - Horarios:
      Lun–Vie 19:00–22:00
      Sáb     10:00–22:00
      Dom     10:00–21:00
    """

    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no existe")

    duration = timedelta(minutes=service.duration_minutes)

    HOURS = {
        0: (time(19, 0), time(22, 0)),  # Lunes
        1: (time(19, 0), time(22, 0)),  # Martes
        2: (time(19, 0), time(22, 0)),  # Miércoles
        3: (time(19, 0), time(22, 0)),  # Jueves
        4: (time(19, 0), time(22, 0)),  # Viernes
        5: (time(10, 0), time(22, 0)),  # Sábado
        6: (time(10, 0), time(21, 0)),  # Domingo
    }

    wd = day.weekday()
    rule = HOURS.get(wd)
    if not rule:
        return []

    WORK_START, WORK_END = rule
    STEP = timedelta(hours=1)  # ✅ SOLO en punto

    start_day_cl = datetime.combine(day, WORK_START, tzinfo=CL_TZ)
    end_day_cl = datetime.combine(day, WORK_END, tzinfo=CL_TZ)

    start_day = start_day_cl.astimezone(UTC)
    end_day = end_day_cl.astimezone(UTC)

    existing = (
        db.query(Booking)
        .filter(
            Booking.barber_id == barber_id,
            Booking.status.in_(ACTIVE_STATUSES),
            Booking.start_time < end_day,
            Booking.end_time > start_day,
        )
        .all()
    )

    slots: List[Dict[str, object]] = []
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
