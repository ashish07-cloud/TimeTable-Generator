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

router.get("/electives", protect, dataController.getElectives);

router.post("/faculty", protect, dataController.saveFaculty);

router.get("/subjects-faculty", protect, dataController.getSubjectsForFaculty);


router.post("/enrollment", protect, dataController.saveEnrollment);

router.get("/enrollment", protect, dataController.getEnrollment);

router.get("/institution", protect, dataController.getInstitution);
router.get("/rooms", protect, dataController.getRooms);
router.get("/subjects", protect, dataController.getSubjects);
router.get("/faculty", protect, dataController.getFaculty);

module.exports = router;
