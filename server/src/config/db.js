const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
    process.env.PG_DATABASE, // matches PG_DATABASE
    process.env.PG_USER,     // matches PG_USER
    process.env.PG_PASSWORD, // matches PG_PASSWORD
    {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT || 5433, // matches PG_PORT
        dialect: 'postgres',
        logging: false, // Set to console.log if you want to see SQL queries
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info(`PostgreSQL Connected on port ${process.env.PG_PORT}`);

        if (process.env.NODE_ENV === 'development') {
            // This creates tables automatically based on your models
            await sequelize.sync({ alter: true });
            logger.info('Database models synchronized.');
        }
    } catch (error) {
        logger.error('Database Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };