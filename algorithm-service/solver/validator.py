from typing import List, Set, Dict
from collections import Counter

from solver.models import TimetableInput, Subject, Faculty, Room, Course, ElectiveGroup, SubjectType


# ---------------- EXCEPTIONS ----------------
class TimetableValidationError(Exception):
    pass


class ResourceConstraintError(TimetableValidationError):
    pass


class IntegrityError(TimetableValidationError):
    pass


# ---------------- VALIDATOR ----------------
class DataValidator:
    def __init__(self, data: TimetableInput):
        self.data = data
        self.subject_map: Dict[str, Subject] = {s.subject_id: s for s in data.subjects}
        self.course_map: Dict[str, Course] = {c.course_id: c for c in data.courses}
        self.faculty_map: Dict[str, Faculty] = {f.faculty_id: f for f in data.faculty}
        self.room_map: Dict[str, Room] = {r.room_id: r for r in data.rooms}
        self.elective_map: Dict[str, ElectiveGroup] = {
            g.elective_group_id: g for g in data.elective_groups
        }

    def validate(self):
        self._check_unique_identifiers()
        self._check_referential_integrity()
        self._check_faculty_qualifications()
        self._check_capacity_feasibility()
        self._check_temporal_feasibility()
        self._check_elective_consistency()

    # ---------------- UNIQUE IDS ----------------
    def _check_unique_identifiers(self):
        entity_types = {
            "Subject": [s.subject_id for s in self.data.subjects],
            "Course": [c.course_id for c in self.data.courses],
            "Faculty": [f.faculty_id for f in self.data.faculty],
            "Room": [r.room_id for r in self.data.rooms],
            "ElectiveGroup": [g.elective_group_id for g in self.data.elective_groups],
        }

        for name, ids in entity_types.items():
            duplicates = [item for item, count in Counter(ids).items() if count > 1]
            if duplicates:
                raise IntegrityError(f"Duplicate {name} IDs found: {duplicates}")

    # ---------------- REFERENTIAL ----------------
    def _check_referential_integrity(self):
        for course in self.data.courses:
            for s_id in course.core_subject_ids:
                if s_id not in self.subject_map:
                    raise IntegrityError(f"Course {course.course_id} references invalid subject {s_id}")

        for faculty in self.data.faculty:
            for s_id in faculty.qualified_subjects:
                if s_id not in self.subject_map:
                    raise IntegrityError(f"Faculty {faculty.faculty_id} references invalid subject {s_id}")

        for group in self.data.elective_groups:
            if group.elective_subject_id not in self.subject_map:
                raise IntegrityError(f"Elective group {group.elective_group_id} has invalid subject")

    # ---------------- FACULTY ----------------
    def _check_faculty_qualifications(self):
        qualified_subjects_pool = set()
        for f in self.data.faculty:
            qualified_subjects_pool.update(f.qualified_subjects)

        for s_id, subject in self.subject_map.items():
            if s_id not in qualified_subjects_pool:
                raise ResourceConstraintError(
                    f"No faculty available for subject {subject.name} ({s_id})"
                )

    # ---------------- CAPACITY ----------------
    def _check_capacity_feasibility(self):
        for course in self.data.courses:
            if not any(r.capacity >= course.student_count and r.is_available for r in self.data.rooms):
                raise ResourceConstraintError(
                    f"No room available for course {course.course_id}"
                )

        for group in self.data.elective_groups:
            subject = self.subject_map[group.elective_subject_id]

            if not any(
                r.capacity >= group.student_count
                and r.room_type == subject.required_room_type
                and r.is_available
                for r in self.data.rooms
            ):
                raise ResourceConstraintError(
                    f"No room available for elective group {group.elective_group_id}"
                )

    # ---------------- TEMPORAL ----------------
    def _check_temporal_feasibility(self):
        total_slots = len(self.data.config.days_enabled) * len(
            [s for s in self.data.config.slots if not s.is_break]
        )

        total_demand = 0
        for course in self.data.courses:
            total_demand += sum(
                self.subject_map[s].hours_per_week for s in course.core_subject_ids
            )

        for group in self.data.elective_groups:
            total_demand += self.subject_map[group.elective_subject_id].hours_per_week

        total_supply = sum(f.max_hours_per_week for f in self.data.faculty)

        if total_demand > total_supply:
            raise ResourceConstraintError("Faculty capacity insufficient")

        for course in self.data.courses:
            course_hours = sum(
                self.subject_map[s].hours_per_week for s in course.core_subject_ids
            )
            if course_hours > total_slots:
                raise ResourceConstraintError(
                    f"Course {course.course_id} exceeds available slots"
                )

    # ---------------- ELECTIVE ----------------
    def _check_elective_consistency(self):
        for group in self.data.elective_groups:
            subject = self.subject_map[group.elective_subject_id]

            if subject.subject_type == SubjectType.CORE:
                raise TimetableValidationError(
                    f"Core subject cannot be elective: {subject.name}"
                )

            for c_id in group.member_course_ids:
                if c_id not in self.course_map:
                    raise IntegrityError(
                        f"Elective group {group.elective_group_id} references invalid course {c_id}"
                    )


# ---------------- ENTRY ----------------
def validate_input(data: TimetableInput):
    validator = DataValidator(data)
    validator.validate()