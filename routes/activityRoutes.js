const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const { getActivitiesByTask, getActivitiesByUser,getRecentActivities } = require('../controllers/activityController');

// Get activities for a specific task
router.get('/task/:taskId', protect, getActivitiesByTask);

// Get activities for a specific user
router.get('/user/:userId', protect, getActivitiesByUser);

// Get recent activities for dashboard
router.get('/recent', protect, getRecentActivities);

module.exports = router;