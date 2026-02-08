from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # requerido
    DATABASE_URL: str

    # ✅ clave para endpoints admin (temporal hasta JWT/cookies)
    # se lee desde apps/api/.env
    ADMIN_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
