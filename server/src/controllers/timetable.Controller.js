const timetableService = require('../services/timetable.service');
const db = require('../models');

exports.generateTimetable = async (req, res) => {
    try {
        // 🔥 1. Extract input
        const { courseId, semester } = req.body;

        // 🔥 2. Get collegeId (multi-tenant safety)
        const collegeId = req.user?.collegeId || req.body.collegeId || "d83fa3be-112a-431b-a98a-e6fc17ec41d9";

        if (!courseId || !semester) {
            return res.status(400).json({
                error: 'courseId and semester are required'
            });
        }

        // 🔥 3. Call SERVICE (not solver directly)
        const timetableData = await timetableService.generateTimetable({
            courseId,
            semester,
            collegeId
        });

        // 🔥 4. Save in DB (FIXED)
        const saved = await db.Timetable.create({
            collegeId, // ✅ corrected (not institutionId)
            academicYear: new Date().getFullYear(),
            semester,
            scheduleData: timetableData,
            createdBy: req.user?.id || 'admin'
        });

        // 🔥 5. Response
        res.status(201).json({
            message: 'Timetable generated successfully',
            data: saved
        });

    } catch (error) {
        console.error("❌ Controller Error:", error.message);

        res.status(500).json({
            error: error.message || 'Failed to generate timetable'
        });
    }
};