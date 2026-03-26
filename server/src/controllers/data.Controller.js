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

