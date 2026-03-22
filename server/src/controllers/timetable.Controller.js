const axios = require('axios');
const db = require('../models');

exports.generateTimetable = async (req, res) => {
    try {
        // 1. Call Python Solver
        const response = await axios.post(
            'http://localhost:8001/api/v1/timetable/generate',
            req.body
        );

        const timetableData = response.data;

        // 2. Save in DB
        const saved = await db.Timetable.create({
            institutionId: timetableData.institution_id,
            academicYear: 2025,
            semester: 3,
            scheduleData: timetableData,
            createdBy: 'admin1'
        });

        // 3. Return response
        res.status(201).json({
            message: 'Timetable generated successfully',
            data: saved
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error: 'Failed to generate timetable'
        });
    }
};