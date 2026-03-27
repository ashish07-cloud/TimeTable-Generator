const db = require("../models");
const solverService = require("./solver.service");

class TimetableService {
  async generateTimetable({ courseId, semester, collegeId }) {
    try {
      // 🔥 FIX: ensure semester is number
      semester = parseInt(semester);

      // 🔥 1. FETCH DATA

      const subjects = await db.Subject.findAll({
        where: { semester, collegeId },
        include: [
          {
            model: db.Faculty,
            attributes: ["id", "name", "maxWeeklyLoad"],
            through: { attributes: [] }, // ✅ removed wrong alias
          },
        ],
      });

      console.log("📥 INPUT:");
      console.log("courseId:", courseId);
      console.log("semester:", semester);
      console.log("collegeId:", collegeId);

      const faculty = await db.Faculty.findAll({
        where: { collegeId },
        include: [
          {
            model: db.Subject,
            as: "QualifiedSubjects",
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
      });

      const rooms = await db.Room.findAll({
        where: { collegeId },
      });

      const studentGroups = await db.StudentGroup.findAll({
        where: { courseId, collegeId },
        include: [
          {
            model: db.Subject,
            as: "CoreSubjects",

            attributes: [
              "id",
              "name",
              "lectureHours",
              "practicalHours",
              "category",
            ],
            through: { attributes: [] },
          },
        ],
      });

      // 🔥 2. DEBUG (VERY IMPORTANT)

      console.log("📊 DATA CHECK:");
      console.log("Subjects:", subjects.length);
      console.log("Faculty:", faculty.length);
      console.log("Rooms:", rooms.length);
      console.log("StudentGroups:", studentGroups.length);

      // 🔥 3. SAFE VALIDATION (better debugging)

      if (!subjects.length) throw new Error("No subjects found");
      if (!faculty.length) throw new Error("No faculty found");
      if (!rooms.length) throw new Error("No rooms found");
      if (!studentGroups.length) throw new Error("No student groups found");

      // 🔥 4. TRANSFORM TO SOLVER FORMAT

      const solverPayload = {
        institution_id: collegeId,

        // ✅ SUBJECTS
        subjects: subjects.map((sub) => ({
          subject_id: sub.id,
          name: sub.name,
          subject_type: sub.category,
          department: "GENERAL", // 🔥 TEMP (you can map later)
          credits: sub.lectureHours + sub.practicalHours || 3,
          hours_per_week: sub.lectureHours + sub.practicalHours,
          duration_per_session: 1,
          required_room_type: "CLASSROOM", // 🔥 TEMP
          is_split_allowed: true,
        })),

        // ✅ COURSES (VERY IMPORTANT)
        courses: studentGroups.map((g) => ({
          course_id: g.id,
          course_name: g.name,
          semester: g.semester,
          academic_year: 2025,
          student_count: g.batchSize,
          core_subject_ids: g.CoreSubjects.map((s) => s.id),
          elective_group_ids: [],
        })),

        // ✅ FACULTY
        faculty: faculty.map((f) => ({
          faculty_id: f.id,
          name: f.name,
          email: f.email || "temp@email.com",
          department: f.department || "GENERAL",
          qualified_subjects: f.QualifiedSubjects.map((s) => s.id),
          max_hours_per_day: 6,
          max_hours_per_week: f.maxWeeklyLoad || 18,
          availability: [
            {
              day: "Mon",
              slots: [1, 2, 3, 4, 5, 6],
            },
          ],
          preferred_slots: [],
        })),

        // ✅ ROOMS
        rooms: rooms.map((r) => ({
          room_id: r.id,
          room_name: r.roomNumber,
          room_type: "CLASSROOM", // 🔥 TEMP mapping
          capacity: r.capacity,
          building_block: r.building || null,
          is_available: true,
        })),

        // ✅ ELECTIVES (EMPTY FOR NOW)
        elective_groups: [],

        // ✅ CONFIG (VERY IMPORTANT)
        config: {
          days_enabled: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          slots: [
            { slot_index: 1, start_time: "09:00", end_time: "10:00" },
            { slot_index: 2, start_time: "10:00", end_time: "11:00" },
            { slot_index: 3, start_time: "11:00", end_time: "12:00" },
            { slot_index: 4, start_time: "12:00", end_time: "13:00" },
            { slot_index: 5, start_time: "14:00", end_time: "15:00" },
            { slot_index: 6, start_time: "15:00", end_time: "16:00" },
          ],
          max_consecutive_faculty_hours: 3,
        },
      };

      // 🔥 DEBUG PAYLOAD
      console.log("📦 Solver Payload:", JSON.stringify(solverPayload, null, 2));

      // 🔥 5. CALL SOLVER
      const solverResult = await solverService.generateTimetable(solverPayload);

      return solverResult;
    } catch (error) {
      console.error("❌ Timetable Service Error:", error.message);
      throw error;
    }
  }
}

module.exports = new TimetableService();
