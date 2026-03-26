exports.validateInstitution = (data) => {
  if (!data.collegeName) {
    throw new Error("College name required");
  }

  if (!data.startTime || !data.endTime) {
    throw new Error("Start and end time required");
  }

  if (!Array.isArray(data.workingDays) || data.workingDays.length === 0) {
    throw new Error("Working days required");
  }

  // 🔥 NEW (COURSES VALIDATION)
  if (data.courses && !Array.isArray(data.courses)) {
    throw new Error("Courses must be an array");
  }
};