const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const { logActivity, getTaskActivity,getTeamActivity,getRecentActivities } = require('../controllers/activityController');

// Get activities for a specific task
router.get('/task/:taskId', protect, getTaskActivity);

// Get activities for a specific user
router.get('/user/:userId', protect, getTeamActivity);

// Get recent activities for dashboard
router.get('/recent', protect, getRecentActivities);

// Log activity (this would typically be called internally, not as an API endpoint)
router.get('/', protect, logActivity);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity feed
 */

/**
 * @swagger
 * /api/activities/task/{taskId}:
 *   get:
 *     summary: Get activity feed for a specific task
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of activities for the task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 activities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/activities/user/{userId}:
 *   get:
 *     summary: Get activity feed for a specific team
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of activities for the team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 activities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Team not found
 */

/**
 * @swagger
 * /api/activities/recent:
 *   get:
 *     summary: Get recent activities for the dashboard (last 20)
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: List of recent activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 activities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 */