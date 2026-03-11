const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");

const {
    getDashboardStats,
    getAllUsers,
    getAllTeams,
    getUserTasks,
    getUserCreatedTasks,
    getTeamTasks,
    getPersonalTasks,
    getAllTeamTasks,
    getTasksByStatus,
    updateUserInfo,
    updateTask,
    updateTeam,
    deleteUser,
    deleteTask,
    deleteTeam,
    getAllTasks
} = require("../controllers/adminController");

// GET /api/admin/dashboard - Get dashboard stats (admin only)
router.get("/dashboard", protect, getDashboardStats);

// GET /api/admin/users - Get all users (admin only)
router.get("/users", protect, getAllUsers);

// GET /api/admin/teams - Get all teams (admin only)
router.get("/teams", protect, getAllTeams);

// GET /api/admin/tasks - Get all tasks (admin only)
router.get("/tasks", protect, getAllTasks);

// GET /api/admin/users/:userId/tasks - Get tasks assigned to a user (admin only)
router.get("/users/:userId/tasks", protect, getUserTasks);

// GET /api/admin/users/:userId/created-tasks - Get tasks created by a user (admin only)
router.get("/users/:userId/created-tasks", protect, getUserCreatedTasks);

// GET /api/admin/teams/:teamId/tasks - Get tasks assigned to a team (admin only)
router.get("/teams/:teamId/tasks", protect, getTeamTasks);

// GET /api/admin/tasks/personal - Get all personal tasks (admin only)
router.get("/tasks/personal", protect, getPersonalTasks);

// GET /api/admin/tasks/team - Get all team tasks (admin only)
router.get("/tasks/team", protect, getAllTeamTasks);

// GET /api/admin/tasks/status/:status - Get tasks by status (admin only)
router.get("/tasks/status/:status", protect, getTasksByStatus);

// PUT /api/admin/users/:userId - Update user info (admin only)
router.put("/users/:userId", protect, updateUserInfo);

// PUT /api/admin/tasks/:taskId - Update task info (admin only)
router.put("/tasks/:taskId", protect, updateTask);

// PUT /api/admin/teams/:teamId - Update team info (admin only)
router.put("/teams/:teamId", protect, updateTeam);

// DELETE /api/admin/users/:userId - Delete a user (admin only)
router.delete("/users/:userId", protect, deleteUser);

// DELETE /api/admin/tasks/:taskId - Delete a task (admin only)
router.delete("/tasks/:taskId", protect, deleteTask);

// DELETE /api/admin/teams/:teamId - Delete a team (admin only)
router.delete("/teams/:teamId", protect, deleteTeam);


module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin only endpoints
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:  { type: integer, example: 10 }
 *                     totalTasks:  { type: integer, example: 50 }
 *                     totalTeams:  { type: integer, example: 5 }
 *                 tasksStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:   { type: string, example: completed }
 *                       count: { type: integer, example: 20 }
 *                 latestUsers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 latestTasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       403:
 *         description: Admin only
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin only
 */

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   put:
 *     summary: Update user info
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string }
 *               email: { type: string }
 *               role:  { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/admin/users/{userId}/tasks:
 *   get:
 *     summary: Get all tasks assigned to a user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks assigned to the user
 */

/**
 * @swagger
 * /api/admin/users/{userId}/created-tasks:
 *   get:
 *     summary: Get all tasks created by a user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks created by the user
 */

/**
 * @swagger
 * /api/admin/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 */

/**
 * @swagger
 * /api/admin/teams/{teamId}:
 *   put:
 *     summary: Update team info
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       404:
 *         description: Team not found
 *
 *   delete:
 *     summary: Delete a team
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       404:
 *         description: Team not found
 */

/**
 * @swagger
 * /api/admin/teams/{teamId}/tasks:
 *   get:
 *     summary: Get all tasks for a team
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks for the team
 */

/**
 * @swagger
 * /api/admin/tasks/personal:
 *   get:
 *     summary: Get all personal tasks
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all personal tasks
 */

/**
 * @swagger
 * /api/admin/tasks/team:
 *   get:
 *     summary: Get all team tasks
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all team tasks
 */

/**
 * @swagger
 * /api/admin/tasks/status/{status}:
 *   get:
 *     summary: Get tasks by status
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, in progress, completed]
 *     responses:
 *       200:
 *         description: List of tasks with the given status
 */

/**
 * @swagger
 * /api/admin/tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *               status:      { type: string, enum: [pending, in progress, completed] }
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *
 *   delete:
 *     summary: Delete a task
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */