import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["PORT", "SOLVER_URL"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
});

const env = {
  PORT: process.env.PORT,
  SOLVER_URL: process.env.SOLVER_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default env;