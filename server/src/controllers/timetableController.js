const orchestrator = require('../services/timetableOrchestrator');

exports.generateAndSave = async (req, res) => {
    try {
        const { courseId, semester } = req.body;
        
        // 1. Validate Input
        if (!courseId || !semester) {
            return res.status(400).json({ 
                success: false, 
                message: "Please select both Course and Semester." 
            });
        }

        // 2. Trigger Orchestrator (Which calls Python)
        console.log(`[Backend] Generating for ${courseId} Sem ${semester}...`);
        const timetable = await orchestrator.generateTimetable(courseId, semester);
        
        // 3. Return the result to Frontend
        res.status(200).json({
            success: true,
            data: timetable
        });

    } catch (error) {
        console.error("[Backend Error]:", error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message || "An error occurred during AI generation." 
        });
    }
};