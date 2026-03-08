const express = require('express');
const router = express.Router();

const { createTask, getTasks
    , getTaskById, updateTask, deleteTask, updateTaskStatus,
    getOverdueTasks, filterTasks
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');


// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', protect, createTask);

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', protect, getTasks);

// @route   GET /api/tasks/:id
// @desc    Get a single task by ID
// @access  Private
router.get('/:id', protect, getTaskById);

// @route   PUT /api/tasks/:id
// @desc    Update a task status
// @access  Private
router.put('/:id', protect, updateTask);

// @route   PUT /api/tasks/:id/status
// @desc    Update a task status
// @access  Private
router.put('/:id/status', protect, updateTaskStatus);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', protect, deleteTask);

// @route   GET /api/tasks/overdue
// @desc    Get all overdue tasks for the authenticated user
// @access  Private
router.get("/overdue", protect, getOverdueTasks);

// @route   GET /api/tasks/filter
// @desc    Filter tasks by status, priority, or due date
// @access  Private
router.get("/filter", protect, filterTasks);




module.exports = router;