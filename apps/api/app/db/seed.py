import uuid
from sqlalchemy.orm import Session

from app.models.barber import Barber
from app.models.service import Service


def run_seed(db: Session):
    # evitar duplicados
    if db.query(Barber).count() > 0:
        print("Seed ya ejecutado")
        return

    barbers = [
        Barber(id=uuid.uuid4(), name="Juan"),
        Barber(id=uuid.uuid4(), name="Pedro"),
    ]

    services = [
        Service(id=uuid.uuid4(), name="Corte", duration_minutes=30),
        Service(id=uuid.uuid4(), name="Corte + Barba", duration_minutes=45),
    ]

    db.add_all(barbers + services)
    db.commit()

    print("Seed insertado correctamente")
