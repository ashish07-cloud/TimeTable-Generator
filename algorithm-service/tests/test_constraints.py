from ortools.sat.python import cp_model
from solver.models import TimetableInput
from solver.constraints import ConstraintBuilder


# -------------------------------
# SAMPLE VALID INPUT
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
# RUN SOLVER FUNCTION
# -------------------------------
def run_solver(input_data, test_name):
    print(f"\n--- {test_name} ---")

    # 1. parse input
    data = TimetableInput(**input_data)

    # 2. create model
    model = cp_model.CpModel()

    # 3. build constraints
    builder = ConstraintBuilder(model, data)
    x = builder.build_all()

    # 4. solve
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    # 5. result
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print("✅ SOLVED")

        # print assignments
        for key, var in x.items():
            if solver.Value(var) == 1:
                print("Assigned:", key)
    else:
        print("❌ NO SOLUTION")


# -------------------------------
# MAIN TESTS
# -------------------------------
if __name__ == "__main__":

    # 1. VALID CASE
    run_solver(valid_input, "VALID INPUT")

    # 2. IMPOSSIBLE HOURS (more hours than slots)
    bad_input_1 = valid_input.copy()
    bad_input_1["courses"][0]["subjects"][0]["hours_per_week"] = 20
    run_solver(bad_input_1, "IMPOSSIBLE HOURS")

    # 3. NO FACULTY AVAILABLE
    bad_input_2 = valid_input.copy()
    bad_input_2["faculty"][0]["availability"] = []
    run_solver(bad_input_2, "NO FACULTY AVAILABILITY")

    # 4. TOO MANY CLASSES, LESS ROOMS
    bad_input_3 = valid_input.copy()
    bad_input_3["rooms"] = [{"room_id": "R1", "type": "CLASSROOM", "capacity": 60}]
    run_solver(bad_input_3, "ROOM SHORTAGE")