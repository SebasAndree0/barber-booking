from sqlalchemy import Column, String, Text, Integer, Float
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base


class Setting(Base):
    __tablename__ = "settings"

    # una sola fila (id fijo = "main")
    id = Column(String(20), primary_key=True, default="main")

    address = Column(String(255), nullable=False, default="Magdalena Petit 15241, San Bernardo")
    whatsapp = Column(String(50), nullable=False, default="+56 9 2942 9715")
    instagram_url = Column(String(255), nullable=False, default="")
    tiktok_url = Column(String(255), nullable=False, default="")

    hours_week = Column(String(80), nullable=False, default="Lun–Vie: 10:00 – 20:00")
    hours_sat = Column(String(80), nullable=False, default="Sábado: 10:00 – 18:00")
    hours_sun = Column(String(80), nullable=False, default="Domingo: Cerrado")

    # pega aquí el src del iframe de Google Maps (no el iframe completo)
    google_maps_embed_url = Column(Text, nullable=False, default="")

    # ✅ NUEVO: reseñas manuales (gratis)
    featured_rating = Column(Float, nullable=True)
    featured_reviews_count = Column(Integer, nullable=True)
    featured_reviews = Column(JSONB, nullable=True)  # lista de {name, rating, text}
