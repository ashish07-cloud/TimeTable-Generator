const express = require("express");
const router = express.Router();
const orchestrator = require("../services/timetableOrchestrator");

router.post("/generate", async (req, res) => {
  try {
    const result = await orchestrator.generateTimetable(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const result = await orchestrator.validateChange(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/save", async (req, res) => {
  const { timetable } = req.body;

  // store in DB (JSON for now)
  const saved = await db.saveTimetable(timetable);

  res.json(saved);
});

module.exports = router;