import json
import random

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
SLOTS_PER_DAY = 6  # 9AM - 3PM
SECTIONS = ["SEC-CSE-3-A", "SEC-CSE-3-B"]

SUBJECTS = [
    {"code": "CS-DSC-05", "name": "Data Structures and Algorithms", "type": "Lecture"},
    {"code": "CS-DSC-06", "name": "Data Structures Lab", "type": "Lab"},
    {"code": "CS-DSC-07", "name": "Discrete Mathematics", "type": "Lecture"},
]

FACULTY = {
    "CS-DSC-05": ["F101", "F102", "F105"],
    "CS-DSC-06": ["F103", "F107", "F109"],
    "CS-DSC-07": ["F102", "F104", "F106"]
}

ROOMS = {
    "Lecture": ["L-101", "L-102", "L-201", "L-202"],
    "Lab": ["CS-LAB-1", "CS-LAB-2"]
}

def generate_timetable():
    timetable = []
    all_slots = [f"{day}-{i}" for day in DAYS for i in range(1, SLOTS_PER_DAY + 1)]
    
    for section in SECTIONS:
        random.shuffle(all_slots)
        used_faculty = set()
        section_assignments = []
        
        # each subject appears 3–5 times a week
        for subject in SUBJECTS:
            faculty = random.choice(FACULTY[subject["code"]])
            room = random.choice(ROOMS[subject["type"]])
            lecture_count = 3 if subject["type"] == "Lab" else 5
            chosen_slots = random.sample(all_slots, lecture_count)
            chosen_slots.sort(key=lambda s: (DAYS.index(s.split('-')[0]), int(s.split('-')[1])))

            for slot in chosen_slots:
                timetable.append({
                    "time_slot": slot,
                    "subject": subject["code"],
                    "section": section,
                    "faculty": faculty,
                    "room": room
                })
                used_faculty.add(faculty)
        
        timetable.extend(section_assignments)
    return timetable

def main():
    timetable = generate_timetable()
    # sort by day and slot for clarity
    timetable.sort(key=lambda x: (DAYS.index(x["time_slot"].split('-')[0]), int(x["time_slot"].split('-')[1])))

    # save to file
    with open("timetable.json", "w") as f:
        json.dump(timetable, f, indent=2)
    
    print(f"✅ Timetable generated successfully with {len(timetable)} entries.")
    print("Output file: timetable.json")

if __name__ == "__main__":
    main()
