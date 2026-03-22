from ortools.sat.python import cp_model
from typing import Dict, List, Tuple, Any

from solver.models import TimetableInput, RoomType


class ConstraintBuilder:
    def __init__(self, model: cp_model.CpModel, data: TimetableInput):
        self.model = model
        self.data = data

        self.subjects = {s.subject_id: s for s in data.subjects}
        self.rooms = {r.room_id: r for r in data.rooms}
        self.faculty = {f.faculty_id: f for f in data.faculty}

        self.days = data.config.days_enabled
        self.slots = [s for s in data.config.slots if not s.is_break]

        # Decision variables
        self.vars: Dict[Tuple[str, str, str, str, Any, int], cp_model.IntVar] = {}

        # Indexing for performance
        self.entity_slot_map: Dict[Tuple[str, Any, int], List[cp_model.IntVar]] = {}
        self.faculty_slot_map: Dict[Tuple[str, Any, int], List[cp_model.IntVar]] = {}
        self.room_slot_map: Dict[Tuple[str, Any, int], List[cp_model.IntVar]] = {}

        self._initialize_variables()

    # ---------------- VARIABLE CREATION ----------------
    def _initialize_variables(self):
        # Core Subjects
        for course in self.data.courses:
            for s_id in course.core_subject_ids:
                subject = self.subjects[s_id]

                qualified_faculty = [
                    f for f in self.data.faculty if s_id in f.qualified_subjects
                ]

                suitable_rooms = [
                    r for r in self.data.rooms
                    if r.room_type == subject.required_room_type
                    and r.capacity >= course.student_count
                    and r.is_available
                ]

                self._create_vars(course.course_id, s_id, qualified_faculty, suitable_rooms)

        # Electives
        for group in self.data.elective_groups:
            s_id = group.elective_subject_id
            subject = self.subjects[s_id]

            qualified_faculty = [
                f for f in self.data.faculty if s_id in f.qualified_subjects
            ]

            suitable_rooms = [
                r for r in self.data.rooms
                if r.room_type == subject.required_room_type
                and r.capacity >= group.student_count
                and r.is_available
            ]

            self._create_vars(group.elective_group_id, s_id, qualified_faculty, suitable_rooms)

    def _create_vars(self, entity_id, s_id, faculty_list, room_list):
        for f in faculty_list:
            availability = {a.day: set(a.slots) for a in f.availability}

            for r in room_list:
                for day in self.days:
                    if day not in availability:
                        continue

                    for slot in self.slots:
                        if slot.slot_index not in availability[day]:
                            continue

                        key = (entity_id, s_id, f.faculty_id, r.room_id, day, slot.slot_index)
                        var = self.model.NewBoolVar(f"x_{entity_id}_{s_id}_{f.faculty_id}_{r.room_id}_{day}_{slot.slot_index}")

                        self.vars[key] = var

                        # Index maps (FAST lookup)
                        self.entity_slot_map.setdefault((entity_id, day, slot.slot_index), []).append(var)
                        self.faculty_slot_map.setdefault((f.faculty_id, day, slot.slot_index), []).append(var)
                        self.room_slot_map.setdefault((r.room_id, day, slot.slot_index), []).append(var)

    # ---------------- HARD CONSTRAINTS ----------------
    def add_weekly_hours(self):
        for entity_id, s_id, *_ in self.vars.keys():
            subject = self.subjects[s_id]

            entity_vars = [
                v for k, v in self.vars.items()
                if k[0] == entity_id and k[1] == s_id
            ]

            if entity_vars:
                self.model.Add(sum(entity_vars) == subject.hours_per_week)

    def add_no_overlap(self):
        # Student clash
        for vars_list in self.entity_slot_map.values():
            self.model.Add(sum(vars_list) <= 1)

        # Faculty clash
        for vars_list in self.faculty_slot_map.values():
            self.model.Add(sum(vars_list) <= 1)

        # Room clash
        for vars_list in self.room_slot_map.values():
            self.model.Add(sum(vars_list) <= 1)

    def add_subject_spread(self):
        for course in self.data.courses:
            for s_id in course.core_subject_ids:
                subject = self.subjects[s_id]

                for day in self.days:
                    day_vars = [
                        v for k, v in self.vars.items()
                        if k[0] == course.course_id and k[1] == s_id and k[4] == day
                    ]

                    if day_vars:
                        limit = 2 if subject.required_room_type != RoomType.CLASSROOM else 1
                        self.model.Add(sum(day_vars) <= limit)

    def add_faculty_workload(self):
        for f in self.data.faculty:
            # Per day
            for day in self.days:
                vars_list = [
                    v for k, v in self.vars.items()
                    if k[2] == f.faculty_id and k[4] == day
                ]
                if vars_list:
                    self.model.Add(sum(vars_list) <= f.max_hours_per_day)

            # Per week
            vars_list = [
                v for k, v in self.vars.items()
                if k[2] == f.faculty_id
            ]
            if vars_list:
                self.model.Add(sum(vars_list) <= f.max_hours_per_week)

    # ---------------- SOFT CONSTRAINTS ----------------
    def add_objective(self):
        obj = []

        for k, v in self.vars.items():
            slot_index = k[5]

            # Prefer earlier slots
            weight = (len(self.slots) - slot_index)
            obj.append(v * weight)

        self.model.Maximize(sum(obj))

    # ---------------- BUILD ----------------
    def build_all(self):
        self.add_weekly_hours()
        self.add_no_overlap()
        self.add_subject_spread()
        self.add_faculty_workload()
        self.add_objective()

        return self.vars