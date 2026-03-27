const {
  Room,
  CollegeConfig,
  Course,
  Subject,
  MasterSubject,
  StudentGroup,
  GroupCoreSubject,
} = require("../models");

const { validateInstitution } = require("../validators/data.validator");
const courseRepo = require("../repositories/course.repo");
const { where } = require("sequelize");
const { Faculty, FacultySubject } = require("../models");

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

  const subjects = await Subject.findAll({
    where: { college_id: config.id },
  });

  // console.log("DB SUBJECTS", subjects.length);

  return {
    step: config.setupStep || 1,
    institution: config,
    courses,
    rooms,
    subjects,
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
    })),
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
    })),
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

exports.getElectives = async () => {
  return await MasterSubject.findAll({
    where: {
      defaultCategory: ["GE", "SEC", "AEC", "VAC"],
    },
  });
};

exports.saveFaculty = async (facultyList, userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (!config) throw new Error("Complete previous steps");

  if (config.setupStep >= 5) {
    throw new Error("Faculty already configured");
  }

  if (!Array.isArray(facultyList) || facultyList.length === 0) {
    throw new Error("Faculty data required");
  }

  // 🔥 STEP 1: Create Faculty
  const createdFaculty = await Faculty.bulkCreate(
    facultyList.map((f) => ({
      name: f.name,
      department: f.department,
      employeeId: f.employeeId || `EMP_${Date.now()}`,
      email: f.email || `${Date.now()}@temp.com`,
      maxWeeklyLoad: f.maxLoad || 16,
      collegeId: config.id,
    })),
    { returning: true },
  );

  // 🔥 STEP 2: Create Mapping (FacultySubject)
  const mappings = [];

  createdFaculty.forEach((fac, index) => {
    const expertiseIds = facultyList[index].expertiseIds || [];

    expertiseIds.forEach((subjectId) => {
      mappings.push({
        facultyId: fac.id,
        subjectId,
      });
    });
  });

  if (mappings.length > 0) {
    await FacultySubject.bulkCreate(mappings);
  }

  // 🔥 STEP 3: Update setup step
  await config.update({ setupStep: 5 });

  return { success: true };
};

exports.getSubjectsForFaculty = async (userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (!config) throw new Error("Invalid college");

  const subjects = await Subject.findAll({
    where: { collegeId: config.id },
    include: [
      {
        model: Course,
        attributes: ["id", "department", "name"],
      },
    ],
  });

  return subjects;
};

exports.saveEnrollment = async (groups, userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (!config) throw new Error("Invalid college");

  if (!Array.isArray(groups) || groups.length === 0) {
    throw new Error("Enrollment data required");
  }

  // 🔥 STEP 1: CLEAR OLD DATA (IMPORTANT)
  await GroupCoreSubject.destroy({
    where: {},
  });

  await StudentGroup.destroy({
    where: { collegeId: config.id },
  });

  const createdGroups = [];

  for (const g of groups) {
    // 🔥 VALIDATION
    if (!g.name || !g.semester || !g.batchSize || !g.courseId) {
      throw new Error(
        "Invalid group data (name, semester, batchSize, courseId required)",
      );
    }

    // ensure numbers
    const semester = parseInt(g.semester);
    const batchSize = parseInt(g.batchSize);

    if (isNaN(semester) || isNaN(batchSize)) {
      throw new Error("Semester and batch size must be numbers");
    }

    // 🔥 CREATE GROUP
    const group = await StudentGroup.create({
      name: g.name,
      semester,
      batchSize,
      courseId: g.courseId,
      programName: g.name,
      academicYear: "2025-26",
      collegeId: config.id,
      electiveChoices: g.electiveCounts || {},
    });

    const mappings = [];

    // 🔥 CORE SUBJECTS
    (g.coreIds || []).forEach((subId) => {
      mappings.push({
        studentGroupId: group.id,
        subjectId: subId,
        type: "CORE",
        isMandatory: true,
      });
    });

    // 🔥 ELECTIVES
    Object.entries(g.electiveCounts || {}).forEach(([subId, count]) => {
      if (count && count > 0) {
        mappings.push({
          studentGroupId: group.id,
          subjectId: subId,
          type: "ELECTIVE",
          isMandatory: false,
        });
      }
    });

    // 🔥 BULK INSERT
    if (mappings.length > 0) {
      await GroupCoreSubject.bulkCreate(mappings);
    }

    createdGroups.push(group);
  }

  // 🔥 OPTIONAL: UPDATE STEP (SAFE)
  if (config.setupStep < 5) {
    await config.update({ setupStep: 5 });
  }

  return {
    success: true,
    groups: createdGroups,
  };
};


exports.getEnrollment = async (userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  if (!config) throw new Error("Invalid college");

  const groups = await StudentGroup.findAll({
    where: { collegeId: config.id },
    include: [
      {
        model: Subject,
        through: { attributes: ["type"] },
      },
    ],
  });

  return groups;
};

exports.getInstitution = async (userId) => {
  return await CollegeConfig.findOne({
    where: { adminId: userId },
  });
};

exports.getRooms = async (userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  return await Room.findAll({
    where: { collegeId: config.id },
  });
};

exports.getSubjects = async (userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  return await Subject.findAll({
    where: { collegeId: config.id },
  });
};

exports.getFaculty = async (userId) => {
  const config = await CollegeConfig.findOne({
    where: { adminId: userId },
  });

  return await Faculty.findAll({
    where: { collegeId: config.id },
    include: [
      {
        model: Subject,
        as: "QualifiedSubjects",
        attributes: ["id", "name", "code"],
      },
    ],
  });
};