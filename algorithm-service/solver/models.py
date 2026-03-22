from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


# ---------------- ENUMS ----------------
class SubjectType(str, Enum):
    CORE = "CORE"
    GE = "GE"
    SEC = "SEC"
    AEC = "AEC"
    VAC = "VAC"


class RoomType(str, Enum):
    CLASSROOM = "CLASSROOM"
    LAB_PHYSICS = "LAB_PHYSICS"
    LAB_COMPUTER = "LAB_COMPUTER"
    LAB_CHEMISTRY = "LAB_CHEMISTRY"
    SEMINAR_HALL = "SEMINAR_HALL"


class DayOfWeek(str, Enum):
    MONDAY = "Mon"
    TUESDAY = "Tue"
    WEDNESDAY = "Wed"
    THURSDAY = "Thu"
    FRIDAY = "Fri"
    SATURDAY = "Sat"
    SUNDAY = "Sun"


# ---------------- SUBJECT ----------------
class Subject(BaseModel):
    model_config = ConfigDict(frozen=True)

    subject_id: str
    name: str
    subject_type: SubjectType
    department: str
    credits: int
    hours_per_week: int
    duration_per_session: int = 1
    required_room_type: RoomType = RoomType.CLASSROOM
    is_split_allowed: bool = True


# ---------------- FACULTY ----------------
class FacultyAvailability(BaseModel):
    day: DayOfWeek
    slots: List[int]


class Faculty(BaseModel):
    faculty_id: str
    name: str
    email: str
    department: str
    qualified_subjects: List[str]   # ONLY THIS (no duplication)
    max_hours_per_day: int = 6
    max_hours_per_week: int = 18
    availability: List[FacultyAvailability]
    preferred_slots: List[int] = Field(default_factory=list)


# ---------------- ROOM ----------------
class Room(BaseModel):
    room_id: str
    room_name: str
    room_type: RoomType
    capacity: int
    building_block: Optional[str] = None
    is_available: bool = True


# ---------------- ELECTIVE GROUP ----------------
class ElectiveGroup(BaseModel):
    elective_group_id: str   # ✅ FIXED (was missing)
    elective_subject_id: str
    student_count: int
    member_course_ids: List[str]


# ---------------- COURSE ----------------
class Course(BaseModel):
    model_config = ConfigDict(extra='ignore')

    course_id: str
    course_name: str
    semester: int
    academic_year: int
    student_count: int
    core_subject_ids: List[str]
    elective_group_ids: List[str] = Field(default_factory=list)


# ---------------- TIME CONFIG ----------------
class TimeSlot(BaseModel):
    slot_index: int
    start_time: str
    end_time: str
    is_break: bool = False


class TimetableConfig(BaseModel):
    days_enabled: List[DayOfWeek]
    slots: List[TimeSlot]
    max_consecutive_faculty_hours: int = 3
    lunch_break_slot_index: Optional[int] = None

    @field_validator("slots")
    def validate_slots(cls, slots):
        indices = [s.slot_index for s in slots]
        if len(indices) != len(set(indices)):
            raise ValueError("Duplicate slot_index found")
        return sorted(slots, key=lambda x: x.slot_index)


# ---------------- INPUT ----------------
class TimetableInput(BaseModel):
    institution_id: str
    subjects: List[Subject]
    courses: List[Course]
    faculty: List[Faculty]
    rooms: List[Room]
    elective_groups: List[ElectiveGroup]
    config: TimetableConfig

    # ✅ CRITICAL VALIDATION
    @field_validator("courses")
    def validate_course_subjects(cls, courses, info):
        subjects = {s.subject_id for s in info.data.get("subjects", [])}

        for course in courses:
            for sid in course.core_subject_ids:
                if sid not in subjects:
                    raise ValueError(f"Invalid subject_id {sid} in course {course.course_id}")

        return courses


# ---------------- OUTPUT ----------------
class TimetableEntry(BaseModel):
    course_id: Optional[str] = None
    elective_group_id: Optional[str] = None
    subject_id: str
    faculty_id: str
    room_id: str
    day: DayOfWeek
    slot_index: int
    duration: int = 1


class TimetableOutput(BaseModel):
    institution_id: str
    schedule: List[TimetableEntry]
    fitness_score: float
    metadata: Dict[str, str] = Field(default_factory=dict)


# ---------------- CLASH REPORT ----------------
class SuggestedSlot(BaseModel):
    day: DayOfWeek
    slot_index: int


class ClashReport(BaseModel):
    is_valid: bool
    clashes: List[str]
    suggested_slots: List[SuggestedSlot] = Field(default_factory=list)