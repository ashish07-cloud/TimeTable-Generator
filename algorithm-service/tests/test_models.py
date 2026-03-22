from solver.models import TimetableInput

sample_input = {
    "courses": [
        {
            "course_id": "BSC-CS-SEM3",
            "semester": 3,
            "subjects": [
                {
                    "name": "DSA",
                    "type": "CORE",
                    "hours_per_week": 4
                }
            ]
        }
    ],
    "faculty": [
        {
            "faculty_id": "F1",
            "name": "Dr. Sharma",
            "subjects": ["DSA"],
            "max_hours_per_day": 3,
            "availability": ["Mon", "Tue", "Wed"]
        }
    ],
    "rooms": [
        {
            "room_id": "R1",
            "type": "CLASSROOM",
            "capacity": 60
        }
    ],
    "student_choices": [],
    "time_config": {
        "days": ["Mon", "Tue", "Wed"],
        "slots_per_day": 6
    }
}

# TEST
if __name__ == "__main__":
    data = TimetableInput(**sample_input)
    print(data)