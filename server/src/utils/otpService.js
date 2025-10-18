// server/src/models/User.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const TABLE_NAME = 'users';

// --- Database Table Setup ---
/**
 * Ensures the 'users' table exists. Should be run once during application startup.
 */
export const ensureTableExists = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'user',
            is_verified BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(createTableQuery);
    console.log(`✅ Table '${TABLE_NAME}' checked/created.`);
};

// --- Core User Functions ---

/**
 * Finds a user by email.
 * @param {string} email - The user's email.
 * @returns {object | null} The user object or null.
 */
export const findByEmail = async (email) => {
    const result = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE email = $1`, [email]);
    return result.rows[0] || null;
};

/**
 * Finds the Super Admin user.
 * @returns {object | null} The super_admin user object or null.
 */
export const findSuperAdmin = async () => {
    const result = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE role = $1`, ['super_admin']);
    return result.rows[0] || null;
};

/**
 * Registers a new user with a hashed password and sets their role.
 * @param {string} email - The user's email.
 * @param {string} password - The plain text password.
 * @param {string} role - The user's role (e.g., 'super_admin').
 * @returns {object} The newly created user object.
 */
export const create = async (email, password, role) => {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await pool.query(
        `INSERT INTO ${TABLE_NAME} (email, password_hash, role, is_verified) 
         VALUES ($1, $2, $3, TRUE) RETURNING id, email, role, is_verified`,
        [email, password_hash, role]
    );

    return result.rows[0];
};

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password.
 * @param {string} hash - The stored hash.
 * @returns {boolean} True if passwords match.
 */
export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

// Run table setup on startup
ensureTableExists();
