import React, { useState } from "react";
import { generateTimetable } from "../../api/timetableService";
import TimetableGrid from "../../components/timetable/TimetableGrid";

const GenerateTimetable = () => {
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState([]);

  // 🔥 Transform backend response → UI format
  const transformData = (response) => {
    const schedule = response?.data?.scheduleData?.schedule || [];

    return schedule.map((item) => ({
      day: item.day,
      slot: item.slot_index + 1, // convert 0 → 1
      subjectId: item.subject_id,
      room: item.room_id,
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const mockData = {
        institution_id: "INST_001",

        subjects: [
          {
            subject_id: "DSA",
            name: "DSA",
            subject_type: "CORE",
            department: "CS",
            credits: 4,
            hours_per_week: 3,
          },
          {
            subject_id: "OS",
            name: "OS",
            subject_type: "CORE",
            department: "CS",
            credits: 3,
            hours_per_week: 2,
          },
        ],

        courses: [
          {
            course_id: "C1",
            course_name: "BSc Computer Science",
            semester: 3,
            academic_year: 2025,
            student_count: 60,
            core_subject_ids: ["DSA", "OS"],
            subjects: [
              {
                subject_id: "DSA",
                name: "DSA",
                subject_type: "CORE",
                department: "CS",
                credits: 4,
                hours_per_week: 3,
              },
              {
                subject_id: "OS",
                name: "OS",
                subject_type: "CORE",
                department: "CS",
                credits: 3,
                hours_per_week: 2,
              },
            ],
          },
        ],

        faculty: [
          {
            faculty_id: "F1",
            name: "Dr. A",
            email: "a@college.edu",
            department: "CS",
            qualified_subjects: ["DSA"],
            subjects: ["DSA"],
            max_hours_per_day: 3,
            availability: [
              { day: "Mon", slots: [0, 1, 2, 3] },
              { day: "Tue", slots: [0, 1, 2, 3] },
              { day: "Wed", slots: [0, 1, 2, 3] },
            ],
          },
          {
            faculty_id: "F2",
            name: "Dr. B",
            email: "b@college.edu",
            department: "CS",
            qualified_subjects: ["OS"],
            subjects: ["OS"],
            max_hours_per_day: 3,
            availability: [
              { day: "Mon", slots: [0, 1, 2, 3] },
              { day: "Tue", slots: [0, 1, 2, 3] },
              { day: "Wed", slots: [0, 1, 2, 3] },
            ],
          },
        ],

        rooms: [
          {
            room_id: "R1",
            room_name: "Room 101",
            room_type: "CLASSROOM",
            capacity: 60,
          },
          {
            room_id: "R2",
            room_name: "Room 102",
            room_type: "CLASSROOM",
            capacity: 60,
          },
        ],

        elective_groups: [],
        student_choices: [],

        config: {
          days_enabled: ["Mon", "Tue", "Wed"],
          slots: [
            { slot_index: 0, start_time: "09:00", end_time: "10:00" },
            { slot_index: 1, start_time: "10:00", end_time: "11:00" },
            { slot_index: 2, start_time: "11:00", end_time: "12:00" },
            { slot_index: 3, start_time: "12:00", end_time: "13:00" },
          ],
        },
      };

      const result = await generateTimetable(mockData);

      console.log("API RESPONSE:", result);

      const formatted = transformData(result);

      console.log("FORMATTED:", formatted);

      setTimetable(formatted);
    } catch (err) {
      console.error(err);
      alert("Generation failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">NEP Timetable Generator</h1>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate Timetable"}
      </button>

      {timetable.length > 0 && (
        <div className="mt-8">
          <TimetableGrid timetableData={timetable} />
        </div>
      )}
    </div>
  );
};

export default GenerateTimetable;
