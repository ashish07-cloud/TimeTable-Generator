const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT || 5433,
    dialect: "postgres",
    logging: false,

    // 🔥 CRITICAL FIX
    define: {
      freezeTableName: true,   // stops "Users"
      tableName: undefined,    // let models define it
      underscored: true,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`PostgreSQL Connected on port ${process.env.PG_PORT}`);

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true }); // ✅ KEEP DATA
      logger.info("Database models synchronized.");
    }
  } catch (error) {
    logger.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };