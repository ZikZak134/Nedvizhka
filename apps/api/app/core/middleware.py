import time
import uuid

import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger()

class MetricMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)
        
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            process_time = time.perf_counter() - start_time
            
            logger.info(
                "request_completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                latency_ms=round(process_time * 1000, 2)
            )
            response.headers["X-Request-Id"] = request_id
            return response
        except Exception as e:
            process_time = time.perf_counter() - start_time
            logger.error(
                "request_failed",
                error=str(e),
                method=request.method,
                path=request.url.path,
                latency_ms=round(process_time * 1000, 2)
            )
            raise e
