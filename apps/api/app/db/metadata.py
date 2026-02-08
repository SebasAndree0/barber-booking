from app.db.base import Base

# importa modelos para que se registren en Base.metadata
from app.models.barber import Barber  # noqa: F401
from app.models.service import Service  # noqa: F401
from app.models.booking import Booking  # noqa: F401

metadata = Base.metadata
