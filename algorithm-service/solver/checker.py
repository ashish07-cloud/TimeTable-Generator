from enum import Enum
from typing import List, Dict, Tuple, Optional, Set, Any
from pydantic import BaseModel
from solver.models import (
    TimetableInput, 
    TimetableEntry, 
    DayOfWeek, 
    Subject, 
    Faculty, 
    Room, 
    ElectiveGroup
)

class ConflictType(str, Enum):
    FACULTY_CLASH = "FACULTY_CLASH"
    ROOM_CLASH = "ROOM_CLASH"
    COURSE_OVERLAP = "COURSE_OVERLAP"
    FACULTY_UNAVAILABLE = "FACULTY_UNAVAILABLE"
    ROOM_UNSUITABLE = "ROOM_UNSUITABLE"
    CAPACITY_EXCEEDED = "CAPACITY_EXCEEDED"
    INVALID_SLOT = "INVALID_SLOT"

class Conflict(BaseModel):
    conflict_type: ConflictType
    message: str
    offending_entries: List[TimetableEntry] = []

class ValidationResult(BaseModel):
    is_valid: bool
    conflicts: List[Conflict]

class TimetableChecker:
    def __init__(self, data: TimetableInput):
        self.data = data
        self.subjects = {s.subject_id: s for s in data.subjects}
        self.faculty = {f.faculty_id: f for f in data.faculty}
        self.rooms = {r.room_id: r for r in data.rooms}
        self.courses = {c.course_id: c for c in data.courses}
        self.elective_groups = {g.elective_group_id: g for g in data.elective_groups}
        
        # Pre-calculate which courses belong to which elective groups for fast lookup
        self.course_to_groups: Dict[str, Set[str]] = {}
        for group in data.elective_groups:
            for course_id in group.member_course_ids:
                if course_id not in self.course_to_groups:
                    self.course_to_groups[course_id] = set()
                self.course_to_groups[course_id].add(group.elective_group_id)

    def validate_move(self, current_schedule: List[TimetableEntry], proposed_entry: TimetableEntry) -> ValidationResult:
        """
        Validates a single 'drag and drop' action. 
        Checks the proposed entry against all other entries in the schedule.
        """
        conflicts = []

        # 1. Basic Resource Metadata Checks
        faculty = self.faculty.get(proposed_entry.faculty_id)
        room = self.rooms.get(proposed_entry.room_id)
        subject = self.subjects.get(proposed_entry.subject_id)

        if not faculty or not room or not subject:
            return ValidationResult(is_valid=False, conflicts=[
                Conflict(conflict_type=ConflictType.INVALID_SLOT, message="Invalid Resource IDs provided.")
            ])

        # 2. Faculty Availability Check
        day_avail = next((a for a in faculty.availability if a.day == proposed_entry.day), None)
        if not day_avail or proposed_entry.slot_index not in day_avail.slots:
            conflicts.append(Conflict(
                conflict_type=ConflictType.FACULTY_UNAVAILABLE,
                message=f"Faculty {faculty.name} is not available on {proposed_entry.day.value} at slot {proposed_entry.slot_index}."
            ))

        # 3. Room Suitability & Capacity Check
        if room.room_type != subject.required_room_type:
            conflicts.append(Conflict(
                conflict_type=ConflictType.ROOM_UNSUITABLE,
                message=f"Room {room.room_name} ({room.room_type}) is not suitable for {subject.name} ({subject.required_room_type})."
            ))

        student_count = 0
        if proposed_entry.course_id:
            student_count = self.courses[proposed_entry.course_id].student_count
        elif proposed_entry.elective_group_id:
            student_count = self.elective_groups[proposed_entry.elective_group_id].student_count
        
        if student_count > room.capacity:
            conflicts.append(Conflict(
                conflict_type=ConflictType.CAPACITY_EXCEEDED,
                message=f"Room capacity ({room.capacity}) exceeded by students ({student_count})."
            ))

        # 4. Schedule-wide Conflict Checks (The "Clash" detection)
        for entry in current_schedule:
            # Skip if we are comparing the moved entry with its previous self (based on course/subject/slot)
            if self._is_same_assignment(entry, proposed_entry):
                continue
            
            # Same Day/Slot Checks
            if entry.day == proposed_entry.day and entry.slot_index == proposed_entry.slot_index:
                
                # Faculty Clash
                if entry.faculty_id == proposed_entry.faculty_id:
                    conflicts.append(Conflict(
                        conflict_type=ConflictType.FACULTY_CLASH,
                        message=f"Faculty {faculty.name} is already assigned to {self.subjects[entry.subject_id].name} in this slot.",
                        offending_entries=[entry]
                    ))

                # Room Clash
                if entry.room_id == proposed_entry.room_id:
                    conflicts.append(Conflict(
                        conflict_type=ConflictType.ROOM_CLASH,
                        message=f"Room {room.room_name} is already occupied by {self.subjects[entry.subject_id].name}.",
                        offending_entries=[entry]
                    ))

                # Student/Course Overlap (The complex part)
                if self._check_student_overlap(entry, proposed_entry):
                    conflicts.append(Conflict(
                        conflict_type=ConflictType.COURSE_OVERLAP,
                        message="Students in this class have a simultaneous lecture/elective group.",
                        offending_entries=[entry]
                    ))

        return ValidationResult(
            is_valid=len(conflicts) == 0,
            conflicts=conflicts
        )

    def _is_same_assignment(self, a: TimetableEntry, b: TimetableEntry) -> bool:
        """Determines if two entry records represent the same logical class instance."""
        return (a.course_id == b.course_id and 
                a.elective_group_id == b.elective_group_id and 
                a.subject_id == b.subject_id and 
                a.day == b.day and 
                a.slot_index == b.slot_index)

    def _check_student_overlap(self, entry_a: TimetableEntry, entry_b: TimetableEntry) -> bool:
        """Checks if students are required to be in two places at once."""
        
        # 1. Both are the same specific course
        if entry_a.course_id and entry_b.course_id and entry_a.course_id == entry_b.course_id:
            return True
        
        # 2. Check if a course is part of an elective group
        # Case A: Entry A is a Course, Entry B is an Elective Group
        if entry_a.course_id and entry_b.elective_group_id:
            group = self.elective_groups[entry_b.elective_group_id]
            if entry_a.course_id in group.member_course_ids:
                return True

        # Case B: Entry B is a Course, Entry A is an Elective Group
        if entry_b.course_id and entry_a.elective_group_id:
            group = self.elective_groups[entry_a.elective_group_id]
            if entry_b.course_id in group.member_course_ids:
                return True

        # Case C: Both are Elective Groups sharing at least one common Course
        if entry_a.elective_group_id and entry_b.elective_group_id:
            group_a_courses = set(self.elective_groups[entry_a.elective_group_id].member_course_ids)
            group_b_courses = set(self.elective_groups[entry_b.elective_group_id].member_course_ids)
            if not group_a_courses.isdisjoint(group_b_courses):
                return True

        return False

    def validate_entire_schedule(self, schedule: List[TimetableEntry]) -> ValidationResult:
        """Iteratively validates every entry in the schedule for global integrity."""
        all_conflicts = []
        for i, entry in enumerate(schedule):
            # Check against all subsequent entries to avoid double-reporting
            res = self.validate_move(schedule[i+1:], entry)
            if not res.is_valid:
                all_conflicts.extend(res.conflicts)
        
        return ValidationResult(
            is_valid=len(all_conflicts) == 0,
            conflicts=all_conflicts
        )