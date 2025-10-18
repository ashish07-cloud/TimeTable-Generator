// server/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

// IMPORTANT: Ensure this environment variable is set
const JWT_SECRET = process.env.JWT_SECRET || 'a_secure_default_secret_for_dev_only';

/**
 * Middleware to verify a JWT token and authenticate the user.
 */
export const protect = (req, res, next) => {
    let token;

    // Check for token in 'Authorization: Bearer <token>' header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach user ID and role to the request object
            req.user = decoded; 

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Middleware to restrict access only to the 'super_admin' role.
 */
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};
