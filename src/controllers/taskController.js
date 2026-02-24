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

