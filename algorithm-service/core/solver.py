# core/solver.py
from .constraints import HardConstraints

class TimetableSolver:
    def __init__(self, data):
        # raw lists (dicts from pandas)
        self.subjects = data.get('subjects', [])
        self.faculty = data.get('faculty', [])
        self.rooms = data.get('rooms', [])
        self.sections = data.get('sections', [])
        self.courses = data.get('courses', [])

        # default time slots (Mon-Fri, 8 slots each). You can change if you add time_slots.csv later
        self.time_slots = [f"{day}-{hour}" for day in ["Mon","Tue","Wed","Thu","Fri"] for hour in range(1,9)]

        self.constraints = HardConstraints()
        self.placements = []

        # Preprocess lookup maps
        self._build_maps()
        print(f"Solver ready: {len(self.subjects)} subjects, {len(self.faculty)} faculty, {len(self.rooms)} rooms, {len(self.sections)} sections.")

    # ---------- helpers to read fields robustly ----------
    def _get(self, rec, keys, default=None):
        """Try multiple possible keys in order (tolerates slightly different CSV headers)."""
        for k in keys:
            if k in rec and rec[k] is not None:
                v = rec[k]
                if isinstance(v, str):
                    return v.strip()
                return v
        return default

    def _faculty_id(self, rec, idx):
        return self._get(rec, ['faculty_id','facultyId','id','faculty'], f"F_auto_{idx}")

    def _room_id(self, rec, idx):
        return self._get(rec, ['room_id','roomId','room_id','room','id','room_name','roomName'], f"R_auto_{idx}")

    def _section_id(self, rec, idx):
        return self._get(rec, ['section_id','sectionId','id','section','section_name','sectionName'], f"S_auto_{idx}")

    def _subject_code(self, rec):
        return self._get(rec, ['subject_code','code','subject','subject_id','subjectCode'])

    def _subject_course(self, rec):
        return self._get(rec, ['course_id','course','courseId'])

    def _subject_semester(self, rec):
        return self._get(rec, ['semester','sem'])

    def _subject_hours(self, rec):
        v = self._get(rec, ['hours_per_week','hours','lectures_per_week','hours_per_week '])  # tolerate trailing space
        if v is None or v == '':
            return 3
        try:
            return int(str(v).strip())
        except:
            try:
                return int(float(str(v)))
            except:
                return 3

    def _subject_room_type(self, rec):
        v = self._get(rec, ['room_type_required','room_type','room_type_required '])
        return str(v).strip().lower() if v is not None else None

    def _section_course(self, rec):
        return self._get(rec, ['course_id','course','courseId'])

    def _section_semester(self, rec):
        v = self._get(rec, ['semester','sem'])
        if v is None or v == '':
            return None
        try:
            return int(str(v).strip())
        except:
            return v

    def _section_students(self, rec):
        v = self._get(rec, ['student_count','students','size','studentCount'])
        try:
            return int(str(v).strip())
        except:
            return None

    def _room_type(self, rec):
        return str(self._get(rec, ['room_type','roomType','room_type ']) or "").strip().lower()

    def _room_capacity(self, rec):
        v = self._get(rec, ['capacity','cap','max_capacity'])
        try:
            return int(str(v).strip())
        except:
            return None

    # ---------- preprocessing ----------
    def _build_maps(self):
        # build lists with normalized ids
        self.faculty_list = []
        for i, f in enumerate(self.faculty):
            fid = self._faculty_id(f, i)
            # parse subjects_can_teach into set of cleaned codes
            raw = self._get(f, ['subjects_can_teach','can_teach','subjects','teaches']) or ''
            # split by comma/semicolon
            items = [s.strip().upper() for part in [raw] for s in part.replace(';',',').split(',') if s.strip()]
            can_teach = set(items)
            self.faculty_list.append({'id': fid, 'record': f, 'can_teach': can_teach})

        self.room_list = []
        for i, r in enumerate(self.rooms):
            rid = self._room_id(r, i)
            rtype = self._room_type(r)
            cap = self._room_capacity(r)
            self.room_list.append({'id': rid, 'record': r, 'type': rtype, 'capacity': cap})

        self.section_list = []
        for i, s in enumerate(self.sections):
            sid = self._section_id(s, i)
            course_id = self._section_course(s)
            sem = self._section_semester(s)
            students = self._section_students(s) or 0
            self.section_list.append({'id': sid, 'record': s, 'course_id': course_id, 'semester': sem, 'students': students})

        # subjects normalized
        self.subject_list = []
        for s in self.subjects:
            code = self._subject_code(s)
            course_id = self._subject_course(s)
            sem = self._subject_semester(s)
            hours = self._subject_hours(s)
            rtype = self._subject_room_type(s)
            self.subject_list.append({'code': str(code), 'course_id': course_id, 'semester': sem, 'hours': int(hours), 'room_type': rtype})

    # ---------- build assignment list ----------
    def _generate_assignments(self):
        """
        Return a list of assignment dicts: each entry is one hour/slot to be scheduled:
        { subject_code, section_id, room_type_required }
        Only subjects where subject.course_id == section.course_id and semester match are included.
        Subjects with course_id containing 'N/A' (elective pool) are skipped by default.
        """
        assignments = []
        for sec in self.section_list:
            for subj in self.subject_list:
                # ensure course_id matches and semester matches
                s_course = (subj['course_id'] or "").strip()
                # skip elective pool unless it matches exactly
                if not s_course or 'N/A' in str(s_course):
                    continue
                if s_course != (sec['course_id'] or "").strip():
                    continue
                # semester check (allow numeric == numeric)
                try:
                    subj_sem = int(subj['semester'])
                except:
                    subj_sem = subj['semester']
                if subj_sem != sec['semester']:
                    continue
                # for each hour/week create an assignment copy
                for _ in range(max(1, subj['hours'])):
                    assignments.append({
                        'subject_code': subj['code'],
                        'section_id': sec['id'],
                        'room_type': subj['room_type'],
                        'course_id': subj['course_id']
                    })
        return assignments

    # ---------- faculty eligibility ----------
    def _faculty_can_teach(self, faculty_entry, subject_code):
        # faculty_entry['can_teach'] is set of codes uppercase
        # subject_code might be None
        if not subject_code:
            return True
        subj_up = subject_code.strip().upper()
        # If faculty has explicit list, require membership
        if faculty_entry['can_teach']:
            return subj_up in faculty_entry['can_teach']
        return True

    # ---------- solver (backtracking) ----------
    def solve(self):
        assignments = self._generate_assignments()
        print(f"Assignments to schedule: {len(assignments)}")

        if not assignments:
            print("No assignments generated. Check CSVs and course/semester mapping.")
            return None

        # sanity: ensure we have faculties and rooms
        if not self.faculty_list:
            print("No faculty records available.")
            return None
        if not self.room_list:
            print("No rooms available.")
            return None

        # structure to store placements per assignment index
        placements = [None] * len(assignments)

        # backtracking function
        def backtrack(idx):
            if idx == len(assignments):
                return True
            a = assignments[idx]
            subj = a['subject_code']
            sec_id = a['section_id']
            required_room_type = (a.get('room_type') or "").strip().lower()

            # look up section student count
            sec_rec = next((s for s in self.section_list if s['id'] == sec_id), None)
            sec_students = sec_rec['students'] if sec_rec else 0

            # try each time slot
            for ts in self.time_slots:
                # try faculties that can teach
                for f in self.faculty_list:
                    fid = f['id']
                    if not self._faculty_can_teach(f, subj):
                        continue
                    # try rooms matching required type and capacity
                    for r in self.room_list:
                        rid = r['id']
                        # room type check if specified
                        rtype = r['type'] or ""
                        if required_room_type and required_room_type != rtype:
                            continue
                        # capacity check
                        cap = r['capacity']
                        if cap is not None and sec_students and cap < sec_students:
                            continue
                        # hard constraints check
                        if self.constraints.is_clash(ts, fid, rid, sec_id):
                            continue
                        # place
                        self.constraints.update_state(ts, fid, rid, sec_id)
                        placements[idx] = {
                            'time_slot': ts,
                            'subject': subj,
                            'section': sec_id,
                            'faculty': fid,
                            'room': rid
                        }
                        # recurse
                        if backtrack(idx + 1):
                            return True
                        # undo
                        self.constraints.remove_state(ts, fid, rid, sec_id)
                        placements[idx] = None
            # no placement found for this assignment -> backtrack
            return False

        success = backtrack(0)
        if success:
            # return placements list
            return [p for p in placements if p is not None]
        else:
            return None
