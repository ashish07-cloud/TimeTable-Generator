from typing import List, Tuple
from solver.models import (
    TimetableInput, 
    TimetableEntry, 
    DayOfWeek, 
    Room
)
from solver.checker import TimetableChecker

class SuggestionEngine:
    def __init__(self, data: TimetableInput):
        self.data = data
        self.checker = TimetableChecker(data)
        self.all_slots = [s.slot_index for s in data.config.slots if not s.is_break]
        self.all_days = data.config.days_enabled

    def get_safe_slots(
        self, 
        current_schedule: List[TimetableEntry], 
        selected_entry: TimetableEntry
    ) -> List[Tuple[DayOfWeek, int, str]]:
        """
        Returns a list of (Day, SlotIndex, RoomID) where the selected_entry 
         can be moved without causing any clashes.
        """
        safe_locations = []

        # 1. Iterate through every possible day in the config
        for day in self.all_days:
            # 2. Iterate through every possible slot
            for slot_index in self.all_slots:
                # 3. Iterate through every available room
                for room in self.data.rooms:
                    if not room.is_available:
                        continue
                    
                    # Create a hypothetical move
                    proposed_move = selected_entry.model_copy(update={
                        "day": day,
                        "slot_index": slot_index,
                        "room_id": room.room_id
                    })

                    # Use the checker to see if this hypothetical move is valid
                    # We pass the schedule EXCEPT the entry we are currently moving
                    other_entries = [
                        e for e in current_schedule 
                        if not self._is_same_logical_class(e, selected_entry)
                    ]
                    
                    validation = self.checker.validate_move(other_entries, proposed_move)

                    if validation.is_valid:
                        safe_locations.append((day, slot_index, room.room_id))

        return safe_locations

    def _is_same_logical_class(self, a: TimetableEntry, b: TimetableEntry) -> bool:
        """
        Identifies if two entries are actually the same class instance 
        (e.g., Physics 101 for Course A).
        """
        # A class is unique by its Subject + (Course OR Elective Group)
        if a.subject_id != b.subject_id:
            return False
        
        if a.course_id and b.course_id:
            return a.course_id == b.course_id
        
        if a.elective_group_id and b.elective_group_id:
            return a.elective_group_id == b.elective_group_id
            
        return False

    def suggest_best_move(
        self, 
        current_schedule: List[TimetableEntry], 
        selected_entry: TimetableEntry
    ) -> List[dict]:
        """
        Formatted for Frontend consumption. 
        Shows available slots for the 'Edit AI Mode' UI.
        """
        safe_slots = self.get_safe_slots(current_schedule, selected_entry)
        
        # Group by day and slot for easier frontend rendering
        suggestions = []
        for day, slot, room_id in safe_slots:
            suggestions.append({
                "day": day.value,
                "slot_index": slot,
                "room_id": room_id,
                "label": f"Available in {room_id}"
            })
            
        return suggestions