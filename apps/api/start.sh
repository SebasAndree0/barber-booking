#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"

# Crea/actualiza tablas en la DB de Render
alembic upgrade head

# Levanta la API
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
