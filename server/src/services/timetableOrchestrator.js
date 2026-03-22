const axios = require("axios");

exports.generateTimetable = async (inputData) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/v1/generate",
      inputData,
      { timeout: 10000 }
    );

    return response.data;

  } catch (error) {
    console.error("Solver Error:", error.message);
    throw new Error("Failed to generate timetable");
  }
};

exports.validateChange = async (data) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/v1/validate",
      data
    );

    return response.data;

  } catch (error) {
    console.error("Validation Error:", error.message);
    throw new Error("Validation failed");
  }
};