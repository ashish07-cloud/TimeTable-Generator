const {
  Room,
  CollegeConfig,
  Course,
  Subject,
  MasterSubject,
} = require("../models");

const { validateInstitution } = require("../validators/data.validator");
const courseRepo = require("../repositories/course.repo");


// 🔹 STEP 1: SAVE INSTITUTION + COURSES
exports.saveInstitutionConfig = async (data, userId) => {
  validateInstitution(data);

  const existing = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (existing && existing.setupStep >= 2) {
    throw new Error("Institution config already completed");
  }

  let config;

  if (existing) {
    config = await existing.update({
      collegeName: data.collegeName,
      workingDays: data.workingDays,
      startTime: data.startTime,
      endTime: data.endTime,
      periodDuration: data.periodDuration,
      slotWindows: data.slotWindows,
      setupStep: 2,
    });
  } else {
    config = await CollegeConfig.create({
      collegeName: data.collegeName,
      workingDays: data.workingDays,
      startTime: data.startTime,
      endTime: data.endTime,
      periodDuration: data.periodDuration,
      slotWindows: data.slotWindows,
      adminId: userId,
      setupStep: 2,
    });
  }

  // 🔥 SAVE COURSES
  if (data.courses && data.courses.length > 0) {
    await courseRepo.createCourses(data.courses, config.id);
  }

  return config;
};


// 🔹 GET PROGRESS
exports.getProgress = async (userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (!config) {
    return {
      step: 1,
      institution: null,
      courses: [],
      rooms: [],
    };
  }

  const rooms = await Room.findAll({
    where: { collegeId: config.id },
  });

  const courses = await Course.findAll({
    where: { collegeId: config.id },
  });

  return {
    step: config.setupStep || 1,
    institution: config,
    courses,
    rooms,
  };
};


// 🔹 STEP 2: ROOMS
exports.saveRooms = async (rooms, userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (!config) throw new Error("Complete Step 1 first");

  if (config.setupStep >= 3) {
    throw new Error("Rooms already configured");
  }

  if (!Array.isArray(rooms) || rooms.length === 0) {
    throw new Error("Rooms data required");
  }

  for (const r of rooms) {
    if (!r.roomNumber || !r.capacity || !r.roomType) {
      throw new Error("Invalid room data");
    }
  }

  await Room.bulkCreate(
    rooms.map((r) => ({
      roomNumber: r.roomNumber,
      capacity: r.capacity,
      roomType: r.roomType,
      building: r.building || null,
      floor: r.floor || null,
      features: r.features || {},
      collegeId: config.id,
    }))
  );

  await config.update({ setupStep: 3 });

  return { success: true };
};


// 🔹 STEP 3: SUBJECTS
exports.saveSubjects = async (subjects, userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (!config) throw new Error("Complete previous steps");

  if (config.setupStep >= 4) {
    throw new Error("Subjects already configured");
  }

  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error("Subjects required");
  }

  await Subject.bulkCreate(
    subjects.map((s) => ({
      ...s,
      collegeId: config.id,
    }))
  );

  await config.update({ setupStep: 4 });

  return { success: true };
};


// 🔹 FETCH CORE SUBJECTS
exports.getCoreSubjects = async (courseId, semester, userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (!config) throw new Error("Invalid college");

  const course = await Course.findOne({
    where: { id: courseId, collegeId: config.id },
  });

  if (!course) throw new Error("Invalid course");

  const subjects = await MasterSubject.findAll({
    where: {
      department: course.department,
      semester,
      defaultCategory: "CORE",
    },
  });

  return subjects;
};