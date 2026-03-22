const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { errorMiddleware } = require('./middlewares/error.middleware');
const routes = require('./routes')

const app = express();

// Security & Optimization Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// API Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;