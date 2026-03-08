const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);


// @route   POST /api/auth/create-admin
// @desc    Create a new admin user
// @access  Private (Admin only)
router.post('/create-admin', require('../middlewares/roleMiddleware').authorizeRoles('admin'), require('../controllers/authController').createAdmin);



module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: John Doe }
 *               email:    { type: string, example: john@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or missing fields
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: john@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200:
 *         description: Login successful, returns token and refreshToken
 *       400:
 *         description: Invalid credentials
 */