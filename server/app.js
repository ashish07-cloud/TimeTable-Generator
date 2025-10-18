import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/v1/authRoutes.js';
import dotenv from 'dotenv';
import pool from './src/config/db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Simple DB test route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ db: 'connected', now: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ db: 'error', error: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);

export default app;
