const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const {
    getTaskActivity,
    getTeamActivity,
    getRecentActivities,
} = require('../controllers/activityController');

// GET /api/activities/recent
router.get('/recent', protect, getRecentActivities);

// GET /api/activities/task/:taskId
router.get('/task/:taskId', protect, getTaskActivity);

// GET /api/activities/team/:teamId  ← fixed: was /user/:userId but calls getTeamActivity
router.get('/team/:teamId', protect, getTeamActivity);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity feed
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
 * /api/activities/team/{teamId}:
 *   get:
 *     summary: Get activity feed for a specific team
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: teamId
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