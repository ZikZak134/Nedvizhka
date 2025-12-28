from fastapi import APIRouter
from app.api.v1 import properties, stats, seed, ingest, heatmap, complexes, parse

api_router = APIRouter()

# Include sub-routers
api_router.include_router(properties.router)
api_router.include_router(stats.router)
api_router.include_router(seed.router)
api_router.include_router(ingest.router)
api_router.include_router(heatmap.router)
api_router.include_router(complexes.router)
api_router.include_router(parse.router)

@api_router.get("/version")
async def version():
    return {"version": "0.2.0"}
