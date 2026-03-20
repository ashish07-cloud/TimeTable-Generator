const express = require('express');
const router = express.Router();
const timetableController = require('../../controllers/timetableController');

// Define the POST endpoint for generation
router.post('/generate', timetableController.generateAndSave);

module.exports = router;