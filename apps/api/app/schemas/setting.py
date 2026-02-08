from pydantic import BaseModel, Field
from typing import List

class FeaturedReview(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=5, max_length=400)

class SettingOut(BaseModel):
    address: str
    whatsapp: str
    instagram_url: str
    tiktok_url: str
    hours_week: str
    hours_sat: str
    hours_sun: str
    google_maps_embed_url: str

    # ✅ NUEVO: reseñas manuales
    featured_rating: float | None = None
    featured_reviews_count: int | None = None
    featured_reviews: List[FeaturedReview] | None = None

    class Config:
        from_attributes = True


class SettingUpdate(BaseModel):
    address: str | None = None
    whatsapp: str | None = None
    instagram_url: str | None = None
    tiktok_url: str | None = None
    hours_week: str | None = None
    hours_sat: str | None = None
    hours_sun: str | None = None
    google_maps_embed_url: str | None = None

    # ✅ NUEVO: reseñas manuales
    featured_rating: float | None = None
    featured_reviews_count: int | None = None
    featured_reviews: List[FeaturedReview] | None = None
