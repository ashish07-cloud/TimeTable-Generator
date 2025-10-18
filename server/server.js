// server/server.js
import 'dotenv/config';           // load env early
import app from './app.js';
import pool from './src/config/db.js';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // quick DB sanity check before starting the server
    await pool.query('SELECT 1');
    console.log('✅ DB sanity check passed');
  } catch (err) {
    console.error('❌ DB sanity check failed. Exiting.');
    console.error(err);
    process.exit(1); // stop startup so you know to fix DB first
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`Endpoints: GET /api/health  GET /api/db-test`);
  });
}

start();
