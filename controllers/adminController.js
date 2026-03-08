const User = require("../models/User");
const Task = require("../models/Task");
const Team = require("../models/Team");

// dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Only admin can access this route
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, Admin only" });
    }

    // count total users, tasks, teams
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalTeams = await Team.countDocuments();

    // count tasks by status
    const tasksStatus = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // tasks per team
    const tasksPerTeam = await Task.aggregate([
      { $match: { team: { $ne: null } } },
      { $group: { _id: "$team", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "team",
        },
      },
      { $unwind: "$team" },
      { $project: { _id: 0, teamName: "$team.name", count: 1 } },
    ]);

    // latest users
    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role");

    // latest tasks
    const latestTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name")
      .select("title status type");

    //today tasks
    const todayCompleted = await Task.countDocuments({
      status: "completed",
      updatedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)), // start of today
        $lt: new Date(new Date().setHours(23, 59, 59, 999)), // end of today
      },
    });

    // top user
    const topUser = await Task.aggregate([
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTasks,
        totalTeams,
      },
      tasksStatus,
      tasksPerTeam,
      latestUsers,
      latestTasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }

  const users = await User.find().select("-password");

  res.status(200).json({
    success: true,
    users,
  });
};

// get all tasks (Admin only)
exports.getAllTasks = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }

  try {
    const tasks = await Task.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("team", "name");

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all teams (Admin only)
exports.getAllTeams = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const teams = await Team.find()
      .populate("leader", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      teams,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all tasks assigned to a user (Admin only)
exports.getUserTasks = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const tasks = await Task.find({
      assignedTo: req.params.userId,
    })
      .populate("createdBy", "name email")
      .populate("team", "name");
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all tasks created by a user (Admin only)
exports.getUserCreatedTasks = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }

  try {
    const tasks = await Task.find({
      createdBy: req.params.userId,
    })
      .populate("assignedTo", "name email")
      .populate("team", "name");
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all tasks for a team (Admin only)
exports.getTeamTasks = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const tasks = await Task.find({
      team: req.params.teamId,
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("team", "name");
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all personal tasks (Admin only)
exports.getPersonalTasks = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const tasks = await Task.find({
      type: "personal",
      assignedTo: req.params.userId,
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all team tasks (Admin only)
exports.getAllTeamTasks = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const tasks = await Task.find({
      type: "team",
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("team", "name");
    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all tasks by status (Admin only)
exports.getTasksByStatus = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }

  try {
    const tasks = await Task.find({
      status: req.params.status,
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("team", "name");
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// update user info
exports.updateUserInfo = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { name, email, role } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// update task details
exports.updateTask = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const task = await Task.findById(req.params.taskId).populate("team");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { name, description, status } = req.body;
    if (name) task.title = name;
    if (description) task.description = description;
    if (status) task.status = status;

    res.status(200).json({
      message: "Task updated successfully",
      task: {
        title: task.title,
        description: task.description,
        status: task.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// update team details
exports.updateTeam = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }

  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    const { name, description } = req.body;
    if (name) team.name = name;
    if (description) team.description = description;
    await team.save();
    res.status(200).json({
      message: "Team updated successfully",
      team: { name: team.name, description: team.description },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.remove();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// delete task
exports.deleteTask = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await task.remove();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// delete team
exports.deleteTeam = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    await team.remove();
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};