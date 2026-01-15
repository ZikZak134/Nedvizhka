from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EstateAnalytics"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: Literal["local", "dev", "prod"] = "local"
    
    # Secrets (should come from env)
    SECRET_KEY: str = "changeme"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "estate_db"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Use SQLite for local development if POSTGRES_SERVER is 'localhost' and no Docker
        if self.ENVIRONMENT == "local":
            return "sqlite:///./estate_analytics_dev.db"
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()
