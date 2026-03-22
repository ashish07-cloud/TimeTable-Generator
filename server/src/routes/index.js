const express = require('express');
const router = express.Router();

const { generateTimetable } = require('../controllers/timetable.controller');

router.post('/generate', generateTimetable);

module.exports = router;