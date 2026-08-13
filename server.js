require('dotenv').config();
require('express-async-errors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const Joi = require('joi');
const winston = require('winston');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const expressSanitizer = require('express-sanitizer');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const xss = require('xss-clean');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Trust proxy for rate limiting behind proxy
app.set('trust proxy', 1);

// Professional Logging Configuration (console-only for Vercel)
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'diabetes-care-api' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request ID middleware for debugging
app.use((req, res, next) => {
    req.id = uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
});

// Response formatting middleware
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        if (typeof data === 'object' && !res.headersSent) {
            data.requestId = req.id;
            data.timestamp = new Date().toISOString();
        }
        originalSend.call(this, data);
    };
    next();
});

// Timeout middleware
app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        logger.warn(`Request timeout for ${req.method} ${req.path}`);
        res.status(504).json({ error: 'Request timeout', requestId: req.id });
    });
    next();
});

// Compression middleware
app.use(compression());

// Body Parser
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization
app.use(xss());
app.use(hpp());
app.use(expressSanitizer());

// HTTP request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

app.use(express.static('public'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many login attempts, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use('/api/forgot-password', authLimiter);
app.use('/api/reset-password', authLimiter);

// In-memory data storage for Vercel serverless
const dataStore = {
    users: [],
    patients: [],
    meals: [],
    appointments: []
};

// Swagger API Documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Diabetes Care API',
            version: '1.0.0',
            description: 'Professional diabetes consulting API documentation',
            contact: {
                name: 'API Support',
                email: 'support@diabetescare.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./server.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Validation Schema
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
    role: Joi.string().valid('patient', 'doctor').required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Feature 1: Authentication Routes
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [patient, doctor]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user exists
 *       500:
 *         description: Server error
 */
app.post('/api/register', async (req, res) => {
    try {
        // Validate input
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            logger.warn(`Registration validation failed: ${error.details[0].message}`);
            return res.status(400).json({ error: error.details[0].message });
        }
        
        const { name, email, password, role } = value;
        
        // Check if user already exists
        if (dataStore.users.find(u => u.email === email)) {
            logger.warn(`Registration attempt with existing email: ${email}`);
            return res.status(409).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const newUser = {
            id: Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
            isVerified: false,
            createdAt: new Date().toISOString()
        };
        
        dataStore.users.push(newUser);
        
        logger.info(`New user registered: ${email}`);
        
        // Generate token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ 
            message: 'Registration successful', 
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } 
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
app.post('/api/login', async (req, res) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            logger.warn(`Login validation failed: ${error.details[0].message}`);
            return res.status(400).json({ error: error.details[0].message });
        }
        
        const { email, password } = value;
        
        const user = dataStore.users.find(u => u.email === email.toLowerCase().trim());
        if (!user) {
            logger.warn(`Login attempt with non-existent email: ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            logger.warn(`Failed login attempt for email: ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        logger.info(`User logged in: ${email}`);
        
        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Email transporter configuration
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Forgot Password
/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const user = dataStore.users.find(u => u.email === email.toLowerCase().trim());
        
        if (!user) {
            // Don't reveal if email exists for security
            return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
        }
        
        // Generate reset token
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // Store reset token in user data
        const userIndex = dataStore.users.findIndex(u => u.email === email.toLowerCase().trim());
        dataStore.users[userIndex].resetToken = resetToken;
        dataStore.users[userIndex].resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
        
        // Send email (if email configuration is set up)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            const transporter = createEmailTransporter();
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@diabetescare.com',
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset for your Diabetes Care account.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you did not request this, please ignore this email.</p>
                `
            });
            
            logger.info(`Password reset email sent to: ${email}`);
        } else {
            logger.warn('Email configuration not set up. Reset token:', resetToken);
        }
        
        res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
        logger.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset Password
/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or validation error
 *       500:
 *         description: Server error
 */
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        
        // Validate new password
        const passwordSchema = Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required();
        const { error } = passwordSchema.validate(newPassword);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const userIndex = dataStore.users.findIndex(u => u.id === decoded.id);
        
        if (userIndex === -1) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        
        // Check if token matches
        if (dataStore.users[userIndex].resetToken !== token) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        
        // Check if token expired
        if (new Date(dataStore.users[userIndex].resetTokenExpiry) < new Date()) {
            return res.status(400).json({ error: 'Token has expired' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        
        // Update user
        dataStore.users[userIndex].password = hashedPassword;
        dataStore.users[userIndex].resetToken = null;
        dataStore.users[userIndex].resetTokenExpiry = null;
        
        logger.info(`Password reset successful for user: ${dataStore.users[userIndex].email}`);
        
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        logger.error('Reset password error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Feature 2: Patient Profile Routes
app.post('/api/patient-profile', authenticateToken, (req, res) => {
    try {
        const { userId, diabetesType, bloodSugarTarget, medications, notes } = req.body;
        
        // Ensure user can only modify their own profile
        if (req.user.id !== userId && req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const patients = dataStore.patients;
        
        const existingIndex = patients.findIndex(p => p.userId === userId);
        const profileData = {
            userId,
            diabetesType,
            bloodSugarTarget,
            medications: medications?.trim() || '',
            notes: notes?.trim() || '',
            updatedAt: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
            patients[existingIndex] = { ...patients[existingIndex], ...profileData };
        } else {
            profileData.createdAt = new Date().toISOString();
            patients.push(profileData);
        }
    } catch (error) {
        console.error('Profile save error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/patient-profile/:userId', authenticateToken, (req, res) => {
    try {
        const requestedUserId = parseInt(req.params.userId);
        
        // Patients can only view their own profile, doctors can view any
        if (req.user.role === 'patient' && req.user.id !== requestedUserId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const patients = dataStore.patients;
        const profile = patients.find(p => p.userId === requestedUserId);
        res.json(profile || null);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Feature 3: Diet Tracking Routes
app.post('/api/meals', authenticateToken, (req, res) => {
    try {
        const { userId, mealType, food, calories, carbs, bloodSugarAfter } = req.body;
        
        // Users can only log their own meals
        if (req.user.id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Validate meal type
        const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!validMealTypes.includes(mealType)) {
            return res.status(400).json({ error: 'Invalid meal type' });
        }
        
        const meals = dataStore.meals;
        
        const newMeal = {
            id: Date.now(),
            userId,
            mealType,
            food: food.trim(),
            calories: parseInt(calories) || 0,
            carbs: parseInt(carbs) || 0,
            bloodSugarAfter: bloodSugarAfter ? parseInt(bloodSugarAfter) : null,
            date: new Date().toISOString(),
            servingSize: req.body.servingSize || null,
            unit: req.body.unit || null
        };
        
        meals.push(newMeal);
        res.json({ message: 'Meal logged successfully' });
    } catch (error) {
        console.error('Meal log error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/meals/:userId', authenticateToken, (req, res) => {
    try {
        const requestedUserId = parseInt(req.params.userId);
        
        // Users can only view their own meals, doctors can view any
        if (req.user.role === 'patient' && req.user.id !== requestedUserId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const meals = dataStore.meals;
        const userMeals = meals.filter(m => m.userId === requestedUserId);
        res.json(userMeals);
    } catch (error) {
        console.error('Meals fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Feature 4: Appointment Routes
app.post('/api/appointments', authenticateToken, (req, res) => {
    try {
        const { patientId, doctorId, date, time, reason } = req.body;
        
        // Patients can only book for themselves, doctors can book for any patient
        if (req.user.role === 'patient' && req.user.id !== patientId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const appointments = dataStore.appointments;
        
        const newAppointment = {
            id: Date.now(),
            patientId,
            doctorId: doctorId || 1, // Default to first doctor if not specified
            date,
            time,
            reason: reason.trim(),
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };
        
        appointments.push(newAppointment);
        res.json({ message: 'Appointment booked successfully' });
    } catch (error) {
        console.error('Appointment booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/appointments/patient/:patientId', authenticateToken, (req, res) => {
    try {
        const requestedPatientId = parseInt(req.params.patientId);
        
        // Patients can only view their own appointments, doctors can view any
        if (req.user.role === 'patient' && req.user.id !== requestedPatientId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const appointments = dataStore.appointments;
        const patientAppointments = appointments.filter(a => a.patientId === requestedPatientId);
        res.json(patientAppointments);
    } catch (error) {
        console.error('Appointments fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/appointments/doctor/:doctorId', authenticateToken, (req, res) => {
    try {
        const requestedDoctorId = parseInt(req.params.doctorId);
        
        // Only doctors can view their appointments
        if (req.user.role !== 'doctor' || req.user.id !== requestedDoctorId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const appointments = dataStore.appointments;
        const doctorAppointments = appointments.filter(a => a.doctorId === requestedDoctorId);
        res.json(doctorAppointments);
    } catch (error) {
        console.error('Doctor appointments fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Feature 5: Education Content (served as static pages)
app.get('/api/education', (req, res) => {
    const educationContent = [
        {
            id: 1,
            title: 'Understanding Diabetes',
            category: 'basics',
            content: 'Diabetes is a chronic condition that affects how your body processes blood sugar (glucose).'
        },
        {
            id: 2,
            title: 'Healthy Eating for Diabetes',
            category: 'diet',
            content: 'A balanced diet with controlled carbohydrate intake is crucial for managing diabetes.'
        },
        {
            id: 3,
            title: 'Blood Sugar Monitoring',
            category: 'monitoring',
            content: 'Regular blood sugar monitoring helps you understand how food, activity, and medication affect your levels.'
        },
        {
            id: 4,
            title: 'Exercise and Diabetes',
            category: 'lifestyle',
            content: 'Physical activity helps your body use insulin more efficiently and lowers blood sugar.'
        },
        {
            id: 5,
            title: 'Medication Management',
            category: 'treatment',
            content: 'Understanding your medications and taking them as prescribed is essential for diabetes control.'
        }
    ];
    res.json(educationContent);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        requestId: req.id,
        path: req.path,
        method: req.method
    });
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        requestId: req.id
    });
});

// Export for Vercel serverless
module.exports = app;

// Listen only if not in Vercel environment
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`Server running at http://localhost:${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
}
