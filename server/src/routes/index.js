const express = require('express');
const router = express.Router();

const { generateTimetable } = require('../controllers/timetable.controller');
const authRoutes = require('./auth.routes');

// ✅ timetable route
router.post('/generate', generateTimetable);

// ✅ auth routes
router.use('/auth', authRoutes);

// test route
router.get('/ping', (req, res) => {
  res.send("PING ROUTER WORKING");
});

module.exports = router;