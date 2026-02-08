from __future__ import annotations

from datetime import datetime, timedelta, date, time, timezone
from typing import List, Dict
from uuid import UUID
import os

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, not_

from app.db.deps import get_db
from app.models.booking import Booking
from app.models.service import Service
from app.schemas.booking import BookingCreate
from app.core.mailer import send_email  # ✅ IMPORTANTE

router = APIRouter()


def _overlaps(a_start: datetime, a_end: datetime, b_start: datetime, b_end: datetime) -> bool:
    """True si [a_start, a_end) se cruza con [b_start, b_end)."""
    return not (a_end <= b_start or a_start >= b_end)


@router.post("/bookings")
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    """
    Crea una reserva:
    - valida UUIDs (422)
    - valida que exista el servicio (404)
    - valida conflicto horario para el barbero (409)
    - calcula end_time según duration_minutes del servicio
    - valida contacto: WhatsApp o Email (uno de los dos)
    - si hay correo, envía confirmación automática (Resend)
    """

    # ✅ Validación: debe venir WhatsApp o Email (uno de los dos)
    phone = (payload.client_phone or "").strip()
    email = (str(payload.client_email).strip() if getattr(payload, "client_email", None) else "")

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

    start = payload.start_time
    # Si start viene sin tz, lo consideramos UTC para mantener consistencia
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)

    end = start + timedelta(minutes=service.duration_minutes)

    conflict = (
        db.query(Booking)
        .filter(
            Booking.barber_id == barber_uuid,
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
        client_phone=phone or None,   # ✅ puede ser null
        client_email=email or None,   # ✅ puede ser null
        start_time=start,
        end_time=end,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # ✅ ENVÍO CORREO AUTOMÁTICO (si hay email)
    if booking.client_email:
        BUSINESS_EMAIL = os.getenv("BUSINESS_EMAIL", "osobarberr@gmail.com")
        BUSINESS_WA = os.getenv("BUSINESS_WA", "+569 2942 9715")
        subject = "Reserva confirmada — OsoBarber"
        text = (
            f"Hola {booking.client_name} 👋\n\n"
            f"Gracias por agendar con OsoBarber. Tu reserva quedó confirmada ✅\n\n"
            f"• Servicio: {service.name}\n"
            f"• Día: {booking.start_time.date()}\n"
            f"• Hora: {booking.start_time.strftime('%H:%M')}\n\n"
            f"Si necesitas cambiar la hora, escríbenos:\n"
            f"📧 {BUSINESS_EMAIL}\n"
            f"📱 {BUSINESS_WA}\n\n"
            f"OsoBarber • San Bernardo"
        )

        # ✅ Si falla el mail, NO rompemos la reserva, pero lo mostramos en consola
        try:
            send_email(booking.client_email, subject, text)
            print("✅ Email enviado a:", booking.client_email)
        except Exception as e:
            print("❌ Error enviando email:", repr(e))

    return {
        "id": str(booking.id),
        "start_time": booking.start_time,
        "end_time": booking.end_time,
    }


@router.get("/bookings")
def list_bookings(
    barber_id: UUID = Query(..., description="UUID del barbero"),
    day: date = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """Lista reservas de un barbero para un día (UTC)."""

    day_start = datetime.combine(day, time(0, 0, 0), tzinfo=timezone.utc)
    day_end = day_start + timedelta(days=1)

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
        }
        for b in rows
    ]


@router.get("/slots")
def list_slots(
    barber_id: UUID = Query(..., description="UUID del barbero"),
    service_id: UUID = Query(..., description="UUID del servicio"),
    day: date = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """Devuelve slots disponibles para un barbero + servicio en un día."""

    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no existe")

    duration = timedelta(minutes=service.duration_minutes)

    WORK_START = time(10, 0)  # 10:00
    WORK_END = time(20, 0)    # 20:00
    STEP = timedelta(minutes=30)

    start_day = datetime.combine(day, WORK_START, tzinfo=timezone.utc)
    end_day = datetime.combine(day, WORK_END, tzinfo=timezone.utc)

    existing = (
        db.query(Booking)
        .filter(
            Booking.barber_id == barber_id,
            Booking.start_time < end_day,
            Booking.end_time > start_day,
        )
        .all()
    )

    slots: List[Dict[str, str]] = []
    cursor = start_day

    while cursor + duration <= end_day:
        slot_start = cursor
        slot_end = cursor + duration

        conflict = any(_overlaps(slot_start, slot_end, b.start_time, b.end_time) for b in existing)

        if not conflict:
            slots.append({"start_time": slot_start.isoformat(), "end_time": slot_end.isoformat()})

        cursor += STEP

    return slots
