const express = require('express');
const router = express.Router();

// test route
router.get('/ping', (req, res) => {
  res.send("PING ROUTER WORKING");
});

// auth routes
const authRoutes = require('./auth.routes');
router.use('/auth', authRoutes);

module.exports = router;