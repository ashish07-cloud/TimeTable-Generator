const express = require("express");
const router = express.Router();

const dataController = require("../controllers/data.Controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.post(
  "/institution",
  protect,
  restrictTo("ADMIN"),
  dataController.saveInstitution,
);

router.get("/progress", protect, dataController.getProgress);

router.post("/rooms", protect, restrictTo("ADMIN"), dataController.saveRooms);

router.post(
  "/subjects",
  protect,
  restrictTo("ADMIN"),
  dataController.saveSubjects,
);

router.get(
  "/core-subjects",
  protect,
  dataController.getCoreSubjects
);

module.exports = router;
