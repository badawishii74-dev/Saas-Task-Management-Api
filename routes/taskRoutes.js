const express = require('express');
const router  = express.Router();

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
    overdueTasks,
    filterTasks,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

// ── Static routes FIRST (before any /:param routes) ───────────────────────

// POST /api/tasks
router.post('/', protect, createTask);

// GET /api/tasks
router.get('/', protect, getTasks);

// GET /api/tasks/overdue  ← MUST be before /:id
router.get('/overdue', protect, overdueTasks);

// GET /api/tasks/filter   ← MUST be before /:id
router.get('/filter', protect, filterTasks);

// ── Param routes AFTER static routes ──────────────────────────────────────

// GET /api/tasks/:id
router.get('/:id', protect, getTaskById);

// PUT /api/tasks/:id
router.put('/:id', protect, updateTask);

// PUT /api/tasks/:id/status  ← MUST be after /:id PUT but uses different path
router.put('/:taskId/status', protect, updateTaskStatus);

// DELETE /api/tasks/:id
router.delete('/:id', protect, deleteTask);

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
 *               title:
 *                 type: string
 *                 example: Fix login bug
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [personal, team]
 *               teamId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
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
 *     summary: Get all tasks for the authenticated user
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
 * /api/tasks/overdue:
 *   get:
 *     summary: Get all overdue tasks for the authenticated user
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of overdue tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
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
 *               status:
 *                 type: string
 *                 enum: [pending, in progress, completed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
