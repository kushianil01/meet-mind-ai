from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MeetMind AI API"
    app_version: str = "1.0.0"
    debug: bool = True

    database_url: str = "sqlite:///./meetmind.db"


    frontend_url: str = "http://localhost:3000"
    groq_api_key: str = ""

    groq_model: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()