const express = require('express');
const router = express.Router();

const { generateTimetable } = require('../controllers/timetable.controller');
const authRoutes = require('./auth.routes');
const dataRoutes = require('./data.routes'); // ✅ ADD THIS

// ✅ timetable route
router.post('/generate', generateTimetable);

// ✅ auth routes
router.use('/auth', authRoutes);

// ✅ data routes (🔥 THIS WAS MISSING)
router.use('/data', dataRoutes);

// test route
router.get('/ping', (req, res) => {
  res.send("PING ROUTER WORKING");
});

module.exports = router;