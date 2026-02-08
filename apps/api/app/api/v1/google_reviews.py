import os
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

GOOGLE_PLACES_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

@router.get("/google-reviews")
async def google_reviews(place_id: str):
    if not GOOGLE_PLACES_KEY:
        raise HTTPException(status_code=500, detail="Missing GOOGLE_PLACES_API_KEY")

    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,rating,user_ratings_total,reviews,url",
        "language": "es",
        "key": GOOGLE_PLACES_KEY,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url, params=params)
        data = r.json()

    if data.get("status") != "OK":
        raise HTTPException(status_code=400, detail=data)

    result = data.get("result", {})
    return {
        "name": result.get("name"),
        "rating": result.get("rating"),
        "user_ratings_total": result.get("user_ratings_total"),
        "url": result.get("url"),
        "reviews": (result.get("reviews") or [])[:5],
    }
