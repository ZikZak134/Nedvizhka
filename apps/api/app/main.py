from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.middleware import MetricMiddleware

setup_logging()
logger = structlog.get_logger()

from app.core.db import Base
from app.core.deps import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Создаём таблицы БД автоматически
    Base.metadata.create_all(bind=engine)
    
    # Startup: Initialize resources (DB pools, Redis)
    logger.info("startup", app_name=settings.PROJECT_NAME)
    yield
    # Shutdown: Close resources
    logger.info("shutdown")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
    # debug=settings.ENVIRONMENT == "local", # Optional, removed for cleanliness
)

app.add_middleware(MetricMiddleware)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://web-zeta-blush-32.vercel.app",
        "https://nedvizhkaestate-analytics-api.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/healthz", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME} 
