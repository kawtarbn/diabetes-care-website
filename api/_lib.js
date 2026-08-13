// Shared utilities for serverless functions
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// In-memory data storage
const dataStore = {
    users: [],
    patients: [],
    meals: [],
    appointments: []
};

// JWT token generation
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// Password hashing
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// Password verification
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// JWT verification
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// Response helper
function sendResponse(res, status, data) {
    res.status(status).json({
        ...data,
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    dataStore,
    generateToken,
    hashPassword,
    verifyPassword,
    verifyToken,
    authenticateToken,
    sendResponse,
    JWT_SECRET
};
