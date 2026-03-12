const express = require('express');
const router = express.Router();

const { createTask, getTasks
    , getTaskById, updateTask, deleteTask, updateTaskStatus,
    overdueTasks, filterTasks
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

// @route   GET /api/tasks/overdue
// @desc    Get all overdue tasks for the authenticated user
// @access  Private
router.get("/overdue", protect, overdueTasks);

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
router.put('/:taskId/status', protect, updateTaskStatus);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', protect, deleteTask);

// @route   GET /api/tasks/filter
// @desc    Filter tasks by status, priority, or due date
// @access  Private
router.get("/filter", protect, filterTasks);




module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type]
 *             properties:
 *               title:       { type: string, example: Fix login bug }
 *               description: { type: string }
 *               type:        { type: string, enum: [personal, team] }
 *               teamId:      { type: string }
 *               assignedTo:  { type: string }
 *               priority:    { type: string, enum: [low, medium, high] }
 *               dueDate:     { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *
 *   get:
 *     summary: Get all tasks assigned to the authenticated user
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               status:      { type: string, enum: [pending, in progress, completed] }
 *               priority:    { type: string, enum: [low, medium, high] }
 *               dueDate:     { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   put:
 *     summary: Update task status only
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, in progress, completed] }
 *     responses:
 *       200:
 *         description: Status updated successfully
 */

/**
 * @swagger
 * /api/tasks/overdue:
 *   get:
 *     summary: Get all overdue tasks for the authenticated user
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of overdue tasks
 */

/**
 * @swagger
 * /api/tasks/filter:
 *   get:
 *     summary: Filter tasks by status, priority or team
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in progress, completed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered tasks
 */