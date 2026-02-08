from app.db.base import Base
from app.db.session import engine

# importa modelos para que SQLAlchemy los registre
from app.models.barber import Barber  # noqa: F401
from app.models.service import Service  # noqa: F401
from app.models.setting import Setting  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
