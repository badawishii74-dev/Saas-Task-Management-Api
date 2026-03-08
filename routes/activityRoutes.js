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