from fastapi import Header, HTTPException
from app.core.config import settings

def require_admin(x_admin_key: str | None = Header(default=None)):
    if not settings.ADMIN_API_KEY:
        raise HTTPException(status_code=500, detail="ADMIN_API_KEY not configured")
    if x_admin_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True
