from fastapi import APIRouter
from app.api.v1 import properties, stats, seed, ingest, heatmap, complexes, parse, infrastructure
from app.api.v1 import districts, complexes_admin, settings, upload, auth

api_router = APIRouter()

# Auth router (без защиты)
api_router.include_router(auth.router)

# Include sub-routers
api_router.include_router(properties.router)
api_router.include_router(stats.router)
api_router.include_router(seed.router)
api_router.include_router(ingest.router)
api_router.include_router(heatmap.router)
api_router.include_router(complexes.router)
api_router.include_router(parse.router)
api_router.include_router(infrastructure.router, prefix="/infrastructure", tags=["infrastructure"])

# Admin CRUD routers
api_router.include_router(districts.router)
api_router.include_router(complexes_admin.router)
api_router.include_router(settings.router)
api_router.include_router(upload.router)

@api_router.get("/version")
async def version():
    return {"version": "0.2.0"}
