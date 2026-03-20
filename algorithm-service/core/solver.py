from ortools.sat.python import cp_model

class TimetableSolver:
    def __init__(self, data):
        self.subjects = data.get('subjects', [])
        self.faculty = data.get('faculty', [])
        self.rooms = data.get('rooms', [])
        self.sections = data.get('sections', [])
        self.days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        self.slots = range(1, 9) # 8 slots per day

    def solve(self):
        model = cp_model.CpModel()
        
        # Variables: (subject, section, day, slot, room, faculty)
        # For MVP simplification: We focus on [subject_section] mapping to [day, slot, room, faculty]
        assignments = {}
        
        # Create a list of "tasks" (Subject-Section combinations)
        tasks = []
        for sec in self.sections:
            for sub in self.subjects:
                if sub['course_id'] == sec['course_id'] and int(sub['semester']) == int(sec['semester']):
                    for h in range(int(sub['hours_per_week'])):
                        tasks.append({'sub': sub, 'sec': sec, 'id': f"{sub['subject_code']}_{sec['section_id']}_{h}"})

        # Define variables for each task
        for task in tasks:
            t_id = task['id']
            # Which day? (0-4)
            assignments[(t_id, 'day')] = model.NewIntVar(0, 4, f'day_{t_id}')
            # Which slot? (0-7)
            assignments[(t_id, 'slot')] = model.NewIntVar(0, 7, f'slot_{t_id}')
            # Which room? (index of self.rooms)
            assignments[(t_id, 'room')] = model.NewIntVar(0, len(self.rooms) - 1, f'room_{t_id}')
            # Which faculty? (index of self.faculty)
            assignments[(t_id, 'faculty')] = model.NewIntVar(0, len(self.faculty) - 1, f'faculty_{t_id}')

        # CONSTRAINTS (Zero Clashes)
        
        # 1. Faculty cannot be in two places at once
        for d in range(5):
            for s in range(8):
                # For every day/slot, sum of faculty appearances must be <= 1 for each faculty member
                for f_idx in range(len(self.faculty)):
                    literals = []
                    for t in tasks:
                        t_id = t['id']
                        # is_this_faculty_at_this_time = (day==d AND slot==s AND faculty==f_idx)
                        is_assigned = model.NewBoolVar(f'f{f_idx}_d{d}_s{s}_{t_id}')
                        model.Add(assignments[(t_id, 'day')] == d).OnlyEnforceIf(is_assigned)
                        model.Add(assignments[(t_id, 'slot')] == s).OnlyEnforceIf(is_assigned)
                        model.Add(assignments[(t_id, 'faculty')] == f_idx).OnlyEnforceIf(is_assigned)
                        literals.append(is_assigned)
                    model.Add(sum(literals) <= 1)

        # 2. Room cannot host two sections at once
        for d in range(5):
            for s in range(8):
                for r_idx in range(len(self.rooms)):
                    literals = []
                    for t in tasks:
                        t_id = t['id']
                        is_assigned = model.NewBoolVar(f'r{r_idx}_d{d}_s{s}_{t_id}')
                        model.Add(assignments[(t_id, 'day')] == d).OnlyEnforceIf(is_assigned)
                        model.Add(assignments[(t_id, 'slot')] == s).OnlyEnforceIf(is_assigned)
                        model.Add(assignments[(t_id, 'room')] == r_idx).OnlyEnforceIf(is_assigned)
                        literals.append(is_assigned)
                    model.Add(sum(literals) <= 1)

        # SOLVE
        solver = cp_model.CpSolver()
        status = solver.Solve(model)

        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            output = []
            for t in tasks:
                t_id = t['id']
                output.append({
                    "day": self.days[solver.Value(assignments[(t_id, 'day')])],
                    "slot": solver.Value(assignments[(t_id, 'slot')]) + 1,
                    "subjectCode": t['sub']['subject_code'],
                    "subjectName": t['sub']['subject_name'],
                    "section": t['sec']['section_id'],
                    "room": self.rooms[solver.Value(assignments[(t_id, 'room')])]['room_id'],
                    "faculty": self.faculty[solver.Value(assignments[(t_id, 'faculty')])]['faculty_name'],
                    "type": t['sub']['nep_category']
                })
            return output
        return None