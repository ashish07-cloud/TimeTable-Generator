require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();
        logger.info('Database connected successfully');

        const server = app.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

        // Handle Graceful Shutdown
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION! Shutting down...');
            logger.error(err.name, err.message);
            server.close(() => process.exit(1));
        });

        process.on('SIGTERM', () => {
            logger.info('SIGTERM RECEIVED. Shutting down gracefully');
            server.close(() => logger.info('Process terminated!'));
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();