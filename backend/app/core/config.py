from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "Wishlist Tracker"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://postgres@localhost:5432/wishlist_db"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://postgres@localhost:5432/wishlist_db"

    SECRET_KEY: str = "change-this-to-a-very-long-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    UPLOAD_DIR: str = "static/uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024

    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_BOT_WEBHOOK_URL: Optional[str] = None

    PARSER_INTERVAL_HOURS: int = 24

    class Config:
        env_file = ".env"


settings = Settings()
