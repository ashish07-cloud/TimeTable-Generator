const dataService = require('../services/data.service');

exports.saveInstitution = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("BODY:", req.body);

    const result = await dataService.saveInstitutionConfig(
      req.body,
      userId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  }catch (err) {
  res.status(400).json({
    message: err.message || 'Failed to save'
  });
}
};

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await dataService.getProgress(userId);

    console.log("API RESPONSE", result);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch progress'
    });
  }
};


exports.saveRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await dataService.saveRooms(
      req.body.rooms,
      userId
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};

exports.saveSubjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await dataService.saveSubjects(
      req.body.subjects,
      userId
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};


exports.getCoreSubjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, semester } = req.query;

    const result = await dataService.getCoreSubjects(
      courseId,
      semester,
      userId
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.getElectives = async (req, res) => {
  const data = await dataService.getElectives();
  res.json(data);
};


exports.saveFaculty = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await dataService.saveFaculty(
      req.body.faculty,
      userId
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.getSubjectsForFaculty = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await dataService.getSubjectsForFaculty(userId);

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};


exports.saveEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await dataService.saveEnrollment(
      req.body.enrollment,
      userId
    );

    res.status(200).json(result);
  } catch (err) {
   res.status(400).json({
  message: err.message,
  errors: err.errors || null, // 🔥 THIS LINE
});
  }
};

exports.getEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await dataService.getEnrollment(userId);

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.getInstitution = async (req, res) => {
  const data = await dataService.getInstitution(req.user.id);
  res.json(data);
};

exports.getRooms = async (req, res) => {
  const data = await dataService.getRooms(req.user.id);
  res.json(data);
};

exports.getSubjects = async (req, res) => {
  const data = await dataService.getSubjects(req.user.id);
  res.json(data);
};

exports.getFaculty = async (req, res) => {
  const data = await dataService.getFaculty(req.user.id);
  res.json(data);
};
