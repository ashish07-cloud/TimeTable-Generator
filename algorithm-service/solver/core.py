import logging
from typing import Dict, List, Tuple, Optional
from ortools.sat.python import cp_model

from solver.models import (
    TimetableInput,
    TimetableOutput,
    TimetableEntry,
    DayOfWeek
)
from solver.constraints import ConstraintBuilder
from utils.exceptions import SolverError, InfeasibleModelError

logger = logging.getLogger(__name__)


class SolverEngine:
    def __init__(self, data: TimetableInput):
        self.data = data
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()

        # Production Solver Configuration
        self.solver.parameters.max_time_in_seconds = 60.0
        self.solver.parameters.num_search_workers = 8
        self.solver.parameters.cp_model_presolve = True

        self.constraint_builder: Optional[ConstraintBuilder] = None
        self.variables: Dict[Tuple[str, str, str, str, str, int], cp_model.IntVar] = {}

  
    def _build(self):
        try:
            self.constraint_builder = ConstraintBuilder(self.model, self.data)
            self.variables = self.constraint_builder.build_all()
            logger.info(f"Model built with {len(self.variables)} decision variables.")
        except Exception as e:
            logger.error(f"Failed to build constraint model: {str(e)}")
            raise SolverError(f"Model construction failed: {str(e)}")

    def _solve(self):
        logger.info("Starting solver...")

        self.status = self.solver.Solve(self.model)

        if self.status == cp_model.INFEASIBLE:
            raise InfeasibleModelError("No feasible timetable")

        if self.status == cp_model.UNKNOWN:
            raise SolverError("Solver timed out")

        return self.status


    def _extract_solution(self) -> TimetableOutput:
        schedule_entries: List[TimetableEntry] = []

        elective_group_ids = {
            g.elective_group_id for g in self.data.elective_groups
        }

        for key, var in self.variables.items():
            if self.solver.Value(var) == 1:
                entity_id, s_id, f_id, r_id, day_val, slot_idx = key

                is_elective = entity_id in elective_group_ids

                entry = TimetableEntry(
                    course_id=None if is_elective else entity_id,
                    elective_group_id=entity_id if is_elective else None,
                    subject_id=s_id,
                    faculty_id=f_id,
                    room_id=r_id,
                    day=DayOfWeek(day_val),
                    slot_index=slot_idx,
                    duration=1,
                )

                schedule_entries.append(entry)

        return TimetableOutput(
            institution_id=self.data.institution_id,
            schedule=schedule_entries,
            fitness_score=0,   # 🔥 TEMP FIX (safe)
            metadata={
                "wall_time": f"{self.solver.WallTime():.2f}s",
                "status": str(self.status),
                "deterministic_time": f"{self.solver.UserTime():.2f}"
            }   
       )

    def generate_timetable(self) -> TimetableOutput:
        self._build()
        self._solve()

        logger.info(f"Solver finished with status: {self.status}")

        return self._extract_solution()