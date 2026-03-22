from solver.models import TimetableInput
from solver.validator import validate_input, ValidationError
import copy


valid_input = {
    "courses": [
        {
            "course_id": "BSC-CS-SEM3",
            "semester": 3,
            "subjects": [
                {"name": "DSA", "type": "CORE", "hours_per_week": 4}
            ],
        }
    ],
    "faculty": [
        {
            "faculty_id": "F1",
            "name": "Dr. Sharma",
            "subjects": ["DSA"],
            "max_hours_per_day": 3,
            "availability": ["Mon", "Tue"],
        }
    ],
    "rooms": [
        {"room_id": "R1", "type": "CLASSROOM", "capacity": 60}
    ],
    "student_choices": [],
    "time_config": {
        "days": ["Mon", "Tue"],
        "slots_per_day": 6,
    },
}


def run_test(input_data, test_name):
    print(f"\n--- {test_name} ---")
    try:
        data = TimetableInput(**input_data)
        validate_input(data)
        print("✅ PASSED")
    except ValidationError as e:
        print("❌ FAILED:", e)


if __name__ == "__main__":

    # 1. VALID CASE
    run_test(valid_input, "VALID INPUT")

    # 2. BREAK: No faculty for subject
    bad_input_1 = copy.deepcopy(valid_input)
    bad_input_1["faculty"][0]["subjects"] = ["OS"]
    run_test(bad_input_1, "NO FACULTY FOR SUBJECT")

    # 3. BREAK: Negative hours
    bad_input_2 = copy.deepcopy(valid_input)
    bad_input_2["courses"][0]["subjects"][0]["hours_per_week"] = -1
    run_test(bad_input_2, "NEGATIVE HOURS")

    # 4. BREAK: No rooms
    bad_input_3 = copy.deepcopy(valid_input)
    bad_input_3["rooms"] = []
    run_test(bad_input_3, "NO ROOMS")

    # 5. BREAK: Invalid student choice
    bad_input_4 = copy.deepcopy(valid_input)
    bad_input_4["student_choices"] = [
        {
            "semester": 3,
            "GE": {"FAKE_SUBJECT": 10},
            "SEC": {},
            "AEC": {},
            "VAC": {},
        }
    ]
    run_test(bad_input_4, "INVALID STUDENT CHOICE")