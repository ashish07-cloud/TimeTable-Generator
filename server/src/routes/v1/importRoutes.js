// server/src/routes/v1/importRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const { importData } = require('../../controllers/dataController');

const router = express.Router();

// Configure multer for temporary file storage
const upload = multer({ dest: path.join(__dirname, '../../uploads/') });

// POST /api/v1/import - Handles all CSV uploads
router.post('/', upload.single('file'), importData);

module.exports = router;