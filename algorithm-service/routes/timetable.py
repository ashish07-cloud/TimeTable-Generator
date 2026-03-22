from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
import logging
import traceback

from solver.models import (TimetableInput,  TimetableOutput, TimetableEntry)
from solver.core import SolverEngine
from solver.checker import TimetableChecker, ValidationResult
from solver.suggestions import SuggestionEngine
from solver.validator import validate_input
from utils.exceptions import SolverError, InfeasibleModelError, TimetableValidationError

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/timetable",
    tags=["Algorithm Service"]
)

# --- REQUEST MODELS FOR MANUAL EDITS ---

class ValidationRequest(BaseModel):
    context: TimetableInput
    current_schedule: List[TimetableEntry]
    proposed_entry: TimetableEntry

class SuggestionRequest(BaseModel):
    context: TimetableInput
    current_schedule: List[TimetableEntry]
    selected_entry: TimetableEntry


# --- ENDPOINTS ---

import traceback

@router.post("/generate", response_model=TimetableOutput, status_code=status.HTTP_201_CREATED)
async def generate_timetable(data: TimetableInput):
    try:
        validate_input(data)

        engine = SolverEngine(data)
        result = engine.generate_timetable()

        return result

    except TimetableValidationError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    except InfeasibleModelError as ime:
        raise HTTPException(status_code=422, detail=str(ime))

    except Exception as e:
        logger.error("=== FULL ERROR TRACE ===")
        traceback.print_exc()   
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate-move", response_model=ValidationResult)
async def validate_manual_move(req: ValidationRequest):
    """
    Used for 'Edit Mode'. Checks if a specific drag-and-drop action 
    causes any clashes (Faculty, Room, or Student Overlaps).
    """
    try:
        checker = TimetableChecker(req.context)
        result = checker.validate_move(req.current_schedule, req.proposed_entry)
        return result
    except Exception as e:
        logger.error(f"Validation Service Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to validate schedule move")


@router.post("/get-suggestions")
async def get_ai_suggestions(req: SuggestionRequest):
    """
    AI Suggestion Tool: Scans the grid and returns all safe (no-clash) 
    boxes for the selected class.
    """
    try:
        suggester = SuggestionEngine(req.context)
        suggestions = suggester.suggest_best_move(
            req.current_schedule, 
            req.selected_entry
        )
        return {
            "selected_class": req.selected_entry.subject_id,
            "available_slots": suggestions
        }
    except Exception as e:
        logger.error(f"Suggestion Service Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate AI suggestions")


@router.post("/check-full-schedule", response_model=ValidationResult)
async def check_full_schedule(req: Dict[str, Any]):
    """
    Validates the entire edited schedule before final approval by Admin.
    """
    try:
        data = TimetableInput(**req["context"])
        schedule = [TimetableEntry(**e) for e in req["schedule"]]
        
        checker = TimetableChecker(data)
        return checker.validate_entire_schedule(schedule)
    except Exception as e:
        logger.error(f"Full Audit Error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid schedule data provided")