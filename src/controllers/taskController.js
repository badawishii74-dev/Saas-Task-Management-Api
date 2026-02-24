const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const task = await Task.create({
            title,
            description,
            user: req.user._id
        });

        res.status(201).json({ message: 'Task created successfully', task });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get all tasks for the authenticated user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id });
        res.status(200).json({ tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

// get a single task by ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the task belongs to the authenticated user
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to access this task' });
        }

        res.status(200).json({ task });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}


// update task status
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the task belongs to the authenticated user
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this task' });
        }

        task.title = req.body.title || task.title;
        task.status = req.body.status || task.status;
        task.description = req.body.description || task.description;

        const updatedTask = await task.save();

        res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the task belongs to the authenticated user
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this task' });
        }
        task.status = req.body.status || task.status;

        const updatedTask = await task.save();
        res.status(200).json({ message: 'Task status updated successfully', task: updatedTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

// delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the task belongs to the authenticated user
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this task' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}