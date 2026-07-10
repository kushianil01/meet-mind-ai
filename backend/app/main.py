from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import (
    CORSMiddleware,
)

from app.config import settings
from app.database import Base, engine
from app.routers.meetings import (
    router as meetings_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(
        bind=engine
    )

    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "REST API for MeetMind AI, "
        "a meeting intelligence and "
        "interactive transcription platform."
    ),
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.125:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    meetings_router,
    prefix="/api/v1",
)


@app.get(
    "/",
    tags=["System"],
)
def root():
    return {
        "application": settings.app_name,
        "message": (
            "MeetMind AI API is running."
        ),
        "documentation": "/docs",
    }


@app.get(
    "/api/v1/health",
    tags=["System"],
)
def health_check():
    return {
        "status": "healthy",
        "application": settings.app_name,
        "version": settings.app_version,
    }