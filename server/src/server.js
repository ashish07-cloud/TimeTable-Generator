require('dotenv').config();

const path = require('path');
const app = require(path.join(__dirname, 'app.js'));
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("🔥 THIS SERVER IS RUNNING");
      console.log(`[INFO] Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

startServer();