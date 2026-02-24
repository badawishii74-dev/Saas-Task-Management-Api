const express = require('express');
const router = express.Router();

const { createTask, getTasks } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');


// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', protect, createTask);

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', protect, getTasks);

module.exports = router;