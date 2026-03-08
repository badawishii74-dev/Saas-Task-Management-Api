const Activity = require("../models/Activity");
const Task = require("../models/Task");
const Team = require("../models/Team");

// Log activity
exports.logActivity = async (taskId = null, teamId = null, userId, action, details) => {
    try {

        await Activity.create({
            task: taskId,
            team: teamId,
            user: userId,
            action,
            details,
        });
    } catch (error) {
        console.error("Error logging activity:", error.message);
    }
};

// Get activity feed for a task
exports.getTaskActivity = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const activities = await Activity.find({ task: req.params.taskId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, activities });
    } catch (error) {
        console.error("Error fetching task activity:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get activity feed for a team
exports.getTeamActivity = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        const activities = await Activity.find({ team: req.params.teamId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, activities });
    } catch (error) {
        console.error("Error fetching team activity:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get recent activities for dashboard
exports.getRecentActivities = async (req, res) => {
    try {
        const activities = await Activity.find()
            .populate("user", "name email")
            .populate("task", "title")
            .populate("team", "name")
            .sort({ createdAt: -1 })
            .limit(20);
            
        res.json({ success: true, activities });
    } catch (error) {
        console.error("Error fetching recent activities:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
