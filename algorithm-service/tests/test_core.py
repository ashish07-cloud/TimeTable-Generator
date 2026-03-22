from solver.models import TimetableInput
from solver.core import SolverEngine


# -------------------------------
# SAMPLE INPUT
# -------------------------------
valid_input = {
    "courses": [
        {
            "course_id": "C1",
            "semester": 3,
            "subjects": [
                {"name": "DSA", "type": "CORE", "hours_per_week": 3},
                {"name": "OS", "type": "CORE", "hours_per_week": 2},
            ],
        }
    ],
    "faculty": [
        {
            "faculty_id": "F1",
            "name": "Dr. A",
            "subjects": ["DSA"],
            "max_hours_per_day": 3,
            "availability": ["Mon", "Tue", "Wed"],
        },
        {
            "faculty_id": "F2",
            "name": "Dr. B",
            "subjects": ["OS"],
            "max_hours_per_day": 3,
            "availability": ["Mon", "Tue", "Wed"],
        },
    ],
    "rooms": [
        {"room_id": "R1", "type": "CLASSROOM", "capacity": 60},
        {"room_id": "R2", "type": "CLASSROOM", "capacity": 60},
    ],
    "student_choices": [],
    "time_config": {
        "days": ["Mon", "Tue", "Wed"],
        "slots_per_day": 4,
    },
}


# -------------------------------
# TEST RUNNER
# -------------------------------
def run_test(input_data, test_name):
    print(f"\n--- {test_name} ---")

    try:
        data = TimetableInput(**input_data)

        engine = SolverEngine(data)
        result = engine.generate_timetable()

        print("✅ TIMETABLE GENERATED")

        for entry in result.timetable:
            print(entry)

    except Exception as e:
        print("❌ FAILED:", e)


# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":

    # 1. VALID CASE
    run_test(valid_input, "VALID INPUT")

    # 2. IMPOSSIBLE CASE
    import copy
    bad_input = copy.deepcopy(valid_input)
    bad_input["courses"][0]["subjects"][0]["hours_per_week"] = 20

    run_test(bad_input, "IMPOSSIBLE CASE")