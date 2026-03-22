const orchestrator = require('../services/timetableOrchestrator');

exports.triggerGeneration = async (req, res) => {
    try {
        // 1. Gather all data from DB (Faculty, Rooms, etc.)
        // const faculty = await Faculty.find(); ...
        
        const inputData = req.body; // For now, taking from body for testing
        const result = await orchestrator.generateTimetable(inputData);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};