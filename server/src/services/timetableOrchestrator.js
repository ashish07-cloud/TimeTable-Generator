// server/src/services/timetableOrchestrator.js

const axios = require('axios');
// Import all necessary models
const MasterSubject = require('../models/MasterSubject');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const Section = require('../models/Section');
// Assume a model for TimeSlots if they are stored in DB
// const TimeSlot = require('../models/TimeSlot');

// The URL for your Python microservice
const ALGORITHM_SERVICE_URL = process.env.ALGORITHM_SERVICE_URL || 'http://127.0.0.1:5001/generate';

/**
 * Gathers all data required for timetabling from the database.
 * @param {string} courseId - The ID of the course (e.g., 'UOD-BSC-CS')
 * @param {number} semester - The semester number (e.g., 3)
 * @returns {object} A consolidated data package for the algorithm.
 */
async function getPlanningData(courseId, semester) {
    // Fetch all data in parallel for performance
    const [subjects, faculty, rooms, sections] = await Promise.all([
        MasterSubject.find({ course_id: courseId, semester: semester, nep_category: { $in: ['Major', 'Minor'] } }).lean(), // MVP: Core subjects only
        Faculty.find().lean(), // Get all faculty, Python will filter by competence
        Room.find().lean(), // Get all rooms
        Section.find({ course_id: courseId, semester: semester }).lean(), // Get the specific sections for this request
    ]);

    // This is the data package that will be sent to the Python service
    return { subjects, faculty, rooms, sections };
}


exports.generateTimetable = async (courseId, semester) => {
    console.log(`Gathering data for ${courseId}, Semester ${semester}...`);
    const inputData = await getPlanningData(courseId, semester);

    if (inputData.subjects.length === 0 || inputData.sections.length === 0) {
        throw new Error('No subjects or sections found for the selected course and semester.');
    }

    console.log('Calling Python algorithm service...');
    try {
        const response = await axios.post(ALGORITHM_SERVICE_URL, {
            data: inputData,
        });

        const generatedTimetable = response.data.timetable;
        
        // Optional: Save the generated timetable to your database here
        // await Timetable.create({ courseId, semester, schedule: generatedTimetable });

        console.log('Timetable generated successfully.');
        return generatedTimetable;

    } catch (error) {
        console.error('Error from Python algorithm service:', error.response ? error.response.data : error.message);
        throw new Error('Timetable generation failed. The algorithm service returned an error.');
    }
};