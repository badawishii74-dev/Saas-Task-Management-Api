const Task = require("../models/Task");
const Team = require("../models/Team");
const { populate } = require("../models/User");
const {
  notifyTaskAssigned,
  notifyTaskUpdated,
  notifyTaskDeleted,
  notifyTaskStatusChanged,
} = require("../services/notificationService");

const { logActivity } = require("../controllers/activityController");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, type, teamId, assignedTo, priority, dueDate } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required" });
    }

    if (type === "team" && !teamId) {
      return res
        .status(400)
        .json({ message: "Team ID is required for team tasks" });
    }

    if (type === "personal") {
      const task = await Task.create({
        title,
        description,
        type,
        priority,
        dueDate,
        createdBy: req.user._id,
        assignedTo: assignedTo || null,
      });

      //log activity
      await logActivity(task._id, null, req.user._id, 'task_created', `Task "${task.title}" was created`);


      if (assignedTo) {
        await notifyTaskAssigned({
          task,
          assignedTo,
          assignedBy: req.user._id,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        task,
      });
    }

    if (type === "team") {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // only leader can create task for team
      if (team.leader.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Only team leader can create tasks for the team" });
      }

      if (!team.members.some((m) => m.toString() === assignedTo)) {
        return res
          .status(400)
          .json({ message: "Assigned user must be a member of the team" });
      }

      const task = await Task.create({
        title,
        description,
        type,
        team: teamId,
        priority,
        dueDate,
        createdBy: req.user._id,
        assignedTo: assignedTo || null,
      });

      if (assignedTo) {
        await notifyTaskAssigned({
          task,
          assignedTo,
          assignedBy: req.user._id,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Team task created successfully",
        task,
      });
    }

    res.status(400).json({ message: "Invalid task type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tasks for the authenticated user
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({
      $or: [
        { assignedTo: userId },   // tasks assigned to user
        { createdBy: userId },    // personal tasks created by user
      ]
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('team', 'name');

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('team', 'name members leader');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const userId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Check access permission
    const isAssigned = task.assignedTo?._id.toString() === userId;
    const isCreator = task.createdBy?._id.toString() === userId;
    const isTeamMember = task.team?.members?.some(
      (m) => m.toString() === userId || m?._id?.toString() === userId
    );
    const isTeamLeader = task.team?.leader?.toString() === userId
      || task.team?.leader?._id?.toString() === userId;

    const hasAccess = isAdmin || isAssigned || isCreator || isTeamMember || isTeamLeader;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Unauthorized to access this task' });
    }

    res.status(200).json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// update task status
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("team");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the task belongs to the authenticated user
    const isOwner = task.assignedTo.toString() === req.user._id.toString();
    const isLeader =
      task.team && task.team.leader.toString() === req.user._id.toString();

    if (!isOwner && !isLeader) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this task" });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this task" });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;

    const updatedTask = await task.save();

    //log activity
    await logActivity(task._id, null, req.user._id, 'task_updated', `Task "${task.title}" was updated`);

    await notifyTaskUpdated({ task: updatedTask, updatedBy: req.user._id });

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'in progress', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only assignedTo or createdBy or admin can update status
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
    const isCreator = task.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAssigned && !isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    //log activity
    await logActivity(task._id, null, req.user._id, 'task_status_updated', `Task "${task.title}" status was updated to "${status}"`);

    res.status(200).json({
      success: true,
      message: 'Task status updated',
      task,
    });
  } catch (err) {
    console.error('updateTaskStatus error:', err); // ← will show exact error in Render logs
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
// delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("team");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the task belongs to the authenticated user
    const isOwner = task.assignedTo.toString() === req.user._id.toString();
    const isLeader =
      task.team && task.team.leader.toString() === req.user._id.toString();

    if (!isOwner && !isLeader) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this task" });
    }

    // capture before deleting
    const taskTitle = task.title;
    const assignedTo = task.assignedTo;

    await task.deleteOne();

    //log activity
    await logActivity(task._id, null, req.user._id, 'task_deleted', `Task "${task.title}" was deleted`);

    await notifyTaskDeleted({
      taskTitle,
      assignedTo,
      deletedBy: req.user._id,
    });

    res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// overdue tasks
exports.overdueTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('team', 'name');

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error('overdueTasks error:', err.message); // ← check Render logs
    res.status(500).json({ message: err.message });    // ← exposes real error
  }
};

// filter tasks
exports.filterTasks = async (req, res) => {
  try {
    const { status, priority, team } = req.query;
    const filter = { assignedTo: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (team) filter.team = team;

    const tasks = await Task.find(filter);

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};