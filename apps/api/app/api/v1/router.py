from fastapi import APIRouter

from app.api.v1.catalog import router as catalog_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.google_reviews import router as google_reviews_router
from app.api.v1.endpoints import availability
from app.api.v1.barbers import router as barbers_router  # ✅ NUEVO

router = APIRouter()

router.include_router(catalog_router)
router.include_router(bookings_router)
router.include_router(google_reviews_router, tags=["google"])
router.include_router(availability.router, tags=["availability"])
router.include_router(barbers_router)  # ✅ NUEVO

@router.get("/ping")
def ping():
    return {"pong": True}
