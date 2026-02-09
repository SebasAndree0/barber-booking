from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.deps import get_db
from app.models.booking import Booking

router = APIRouter()

# ✅ Zona horaria del negocio (Chile)
TZ = ZoneInfo("America/Santiago")

# ✅ Horarios fijos:
# Lun–Vie 19:00–22:00
# Sáb–Dom 10:00–23:00

HOURS = {
    0: ("19:00", "22:00"),  # Lunes
    1: ("19:00", "22:00"),  # Martes
    2: ("19:00", "22:00"),  # Miércoles
    3: ("19:00", "22:00"),  # Jueves
    4: ("19:00", "22:00"),  # Viernes
    5: ("10:00", "22:00"),  # Sábado
    6: ("10:00", "21:00"),  # Domingo
}


def parse_hhmm(s: str) -> time:
    hh, mm = s.split(":")
    return time(int(hh), int(mm))

@router.get("/availability")
def get_availability(
    barber_id: str,
    day: date = Query(..., description="YYYY-MM-DD"),
    service_minutes: int = Query(60, ge=10, le=240),
    db: Session = Depends(get_db),
):
    wd = day.weekday()
    rule = HOURS.get(wd)

    # Día sin horario (cerrado)
    if not rule:
        return {"date": str(day), "slots": []}

    start_t = parse_hhmm(rule[0])
    end_t = parse_hhmm(rule[1])

    # ✅ Creamos datetimes en hora Chile (aware)
    start_local = datetime.combine(day, start_t, tzinfo=TZ)
    end_local = datetime.combine(day, end_t, tzinfo=TZ)

    if end_local <= start_local:
        return {"date": str(day), "slots": []}

    # ✅ Para consultar DB (timestamptz), convertimos a UTC
    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)

    # Reservas que cruzan el rango del día laboral (en UTC)
    bookings = (
        db.query(Booking)
        .filter(
            and_(
                Booking.barber_id == barber_id,
                Booking.start_time < end_utc,
                Booking.end_time > start_utc,
            )
        )
        .all()
    )

    busy = [(b.start_time, b.end_time) for b in bookings]  # aware UTC

    step = timedelta(minutes=service_minutes)

    # ✅ cursor en UTC para que DST no "coma" horas
    cursor_utc = start_utc
    slots = []

    while cursor_utc + step <= end_utc:
        slot_start_utc = cursor_utc
        slot_end_utc = cursor_utc + step

        ok = True
        for bs, be in busy:
            # se cruzan si NO se cumplen estas separaciones
            if not (slot_end_utc <= bs or slot_start_utc >= be):
                ok = False
                break

        if ok:
            # ✅ devolvemos en hora Chile con offset correcto del día
            slots.append(slot_start_utc.astimezone(TZ).isoformat())

        cursor_utc += step

    return {"date": str(day), "slots": slots}
