const { Course } = require("../models");

exports.createCourses = async (courses, collegeId) => {
  if (!Array.isArray(courses) || courses.length === 0) return [];

  const normalized = courses.map((name) => {
    let department = "GENERAL";

    if (name.includes("Computer")) department = "Computer Science";
    else if (name.includes("Physics")) department = "Physics";
    else if (name.includes("Chemistry")) department = "Chemistry";
    else if (name.includes("English")) department = "English";
    else if (name.includes("Political")) department = "Political Science";
    else if (name.includes("Commerce") || name.includes("B.Com"))
      department = "Commerce";

    return {
      name: name.trim(),
      department,
      collegeId,
    };
  });

  const existing = await Course.findAll({
    where: { collegeId },
  });

  const existingNames = new Set(existing.map((c) => c.name));

  const newCourses = normalized.filter((c) => !existingNames.has(c.name));

  if (newCourses.length === 0) return [];

  return await Course.bulkCreate(newCourses);
};
