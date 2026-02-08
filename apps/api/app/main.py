from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import router as v1_router
from app.db.init_db import init_db
from app.db.session import engine

app = FastAPI(title="OsoBarber Booking API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://osobarber.cl",
        "https://www.osobarber.cl",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(v1_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/db/health")
def db_health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"db": "ok"}
