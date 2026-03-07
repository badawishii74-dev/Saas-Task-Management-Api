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