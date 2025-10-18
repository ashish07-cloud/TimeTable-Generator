# core/constraints.py
class HardConstraints:
    def __init__(self):
        # Key: time_slot, Value: {'faculty': set(), 'room': set(), 'section': set()}
        self.schedule_state = {}

    def is_clash(self, time_slot, faculty_id, room_id, section_id):
        slot_state = self.schedule_state.get(time_slot)
        if not slot_state:
            return False
        if faculty_id and faculty_id in slot_state['faculty']:
            return True
        if room_id and room_id in slot_state['room']:
            return True
        if section_id and section_id in slot_state['section']:
            return True
        return False

    def update_state(self, time_slot, faculty_id, room_id, section_id):
        if time_slot not in self.schedule_state:
            self.schedule_state[time_slot] = {'faculty': set(), 'room': set(), 'section': set()}
        if faculty_id:
            self.schedule_state[time_slot]['faculty'].add(faculty_id)
        if room_id:
            self.schedule_state[time_slot]['room'].add(room_id)
        if section_id:
            self.schedule_state[time_slot]['section'].add(section_id)

    def remove_state(self, time_slot, faculty_id, room_id, section_id):
        """Undo update for backtracking"""
        if time_slot not in self.schedule_state:
            return
        if faculty_id and faculty_id in self.schedule_state[time_slot]['faculty']:
            self.schedule_state[time_slot]['faculty'].remove(faculty_id)
        if room_id and room_id in self.schedule_state[time_slot]['room']:
            self.schedule_state[time_slot]['room'].remove(room_id)
        if section_id and section_id in self.schedule_state[time_slot]['section']:
            self.schedule_state[time_slot]['section'].remove(section_id)

        s = self.schedule_state[time_slot]
        if not s['faculty'] and not s['room'] and not s['section']:
            del self.schedule_state[time_slot]
