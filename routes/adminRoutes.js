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
    deleteTeam
} = require("../controllers/adminController");

// GET /api/admin/dashboard - Get dashboard stats (admin only)
router.get("/dashboard", protect, getDashboardStats);

// GET /api/admin/users - Get all users (admin only)
router.get("/users", protect, getAllUsers);

// GET /api/admin/teams - Get all teams (admin only)
router.get("/teams", protect, getAllTeams);

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
