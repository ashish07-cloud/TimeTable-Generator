from typing import Any, Dict, Optional

class TimetableBaseException(Exception):
    """Base exception for all timetable service errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}

class TimetableValidationError(TimetableBaseException):
    """Raised when the input data fails schema or logic validation."""
    pass

class ResourceConflictError(TimetableBaseException):
    """Raised when there is a physical resource clash (e.g., Room/Faculty double booking)."""
    pass

class SolverError(TimetableBaseException):
    """Raised when the OR-Tools solver encounters an internal engine error."""
    pass

class InfeasibleModelError(SolverError):
    """
    Raised when the mathematical model is logically impossible to solve 
    given the constraints (e.g., more hours required than slots available).
    """
    pass

class ConstraintViolationError(TimetableBaseException):
    """Raised when a manual edit (Drag & Drop) violates hard constraints."""
    pass