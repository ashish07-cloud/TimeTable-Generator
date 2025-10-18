import pool from '../config/db.js';

export const createUser = async ({ username, email, password, otp, otp_expires }) => {
  const result = await pool.query(
    `INSERT INTO users (username, email, password, otp, otp_expires)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [username, email, password, otp, otp_expires]
  );
  return result.rows[0];
};

export const getUserByEmail = async (emailRaw) => {
  const email = String(emailRaw || '').trim().toLowerCase();
  const result = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1',
    [email]
  );
  return result.rows[0];
};

export const verifyUser = async (email) => {
  const result = await pool.query(
    `UPDATE users SET is_verified=true, otp=NULL, otp_expires=NULL WHERE email=$1 RETURNING *`,
    [email]
  );
  return result.rows[0];
};
