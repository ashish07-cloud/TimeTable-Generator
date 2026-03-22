import logging
import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.gzip import GZipMiddleware

from routes.timetable import router as timetable_router
from utils.exceptions import SolverError, InfeasibleModelError
from utils.logger import setup_logging

# Initialize Production Logging
setup_logging()
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title="College Timetable AI Solver Service",
        description="NEP-Compliant Constraint Satisfaction Engine using Google OR-Tools",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc"
    )

    # Middleware: CORS (Adjust origins for production)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Middleware: GZip Compression for large Timetable JSON payloads
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Request Profiling Middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = "{0:.2f}".format(process_time)
        logger.info(
            f"rid={request.scope.get('root_path')} method={request.method} "
            f"path={request.url.path} status_code={response.status_code} "
            f"completed_in={formatted_process_time}ms"
        )
        return response

    # Global Exception Handlers
    @app.exception_handler(InfeasibleModelError)
    async def infeasible_model_handler(request: Request, exc: InfeasibleModelError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"error": "Infeasible Model", "detail": str(exc)},
        )

    @app.exception_handler(SolverError)
    async def solver_error_handler(request: Request, exc: SolverError):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Solver Engine Failure", "detail": str(exc)},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"Schema Validation Error: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Data Integrity Error", "detail": exc.errors()},
        )

    # Health Check
    @app.get("/health", tags=["System"])
    async def health_check():
        return {
            "status": "healthy",
            "service": "algorithm-service",
            "timestamp": time.time()
        }

    # Include Routers
    app.include_router(timetable_router, prefix="/api/v1")

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    # Use standard production worker settings
    uvicorn.run(
        "app:app", 
        host="0.0.0.0", 
        port=8001, 
        reload=True, 
        workers=4,
        log_level="info"
    )