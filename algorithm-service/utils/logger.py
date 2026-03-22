import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

def setup_logging():
    """
    Configures a production-grade logging system with both Console and 
    File rotation handlers.
    """
    log_format = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    )

    # 1. Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)

    # 2. Rotating File Handler (Keeps logs even if container restarts)
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    file_handler = RotatingFileHandler(
        log_dir / "solver_service.log", 
        maxBytes=10*1024*1024, # 10MB
        backupCount=5
    )
    file_handler.setFormatter(log_format)

    # 3. Root Logger Configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers to avoid duplicate logs
    if root_logger.hasHandlers():
        root_logger.handlers.clear()
        
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    # 4. Silence noisy third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    logging.getLogger("ortools").setLevel(logging.ERROR)

    logging.info("Production logging initialized successfully.")

def get_logger(name: str):
    """Utility to get a named logger."""
    return logging.getLogger(name)