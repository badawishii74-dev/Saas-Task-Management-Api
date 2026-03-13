const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { notifyCommentAdded } = require("../services/notificationService");
const { logActivity } = require("../controllers/activityController");

// Create a new comment
exports.createComment = async (req, res) => {
    try{
        const {text} = req.body;

        const task = await Task.findById(req.params.taskId);
        if(!task){
            return res.status(404).json({message: "Task not found"});
        }

        const comment = await Comment.create({
            task: req.params.taskId,
            user: req.user._id,
            text,
        });
        await notifyCommentAdded({ task, commentBy: req.user._id });
        await logActivity(null, task._id, req.user._id, 'comment_added', `User "${req.user.name}" added a comment to the task`);
        res.status(201).json({message: "Comment created successfully", comment});
    }
    catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// Get comments for a task
exports.getTaskComments = async (req, res) => {
    try{
        const comments = await Comment.find({task: req.params.taskId})
        .populate('user', 'name email')
        .sort({createdAt: -1});

        res.status(200).json({comments});
    }
    catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try{
        const comment = await Comment.findById(req.params.commentId);
        if(!comment){
            return res.status(404).json({message: "Comment not found"});
        }

        await logActivity(null, task._id, req.user._id, 'comment_deleted', `User "${req.user.name}" deleted a comment from the task`);
        await Comment.findByIdAndDelete(req.params.commentId);
        res.status(200).json({message: "Comment deleted successfully"});
    }
    catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// Update a comment
exports.updateComment = async (req, res) => {
    try{
        const {text} = req.body;
        const comment = await Comment.findById(req.params.commentId);
        if(!comment){
            return res.status(404).json({message: "Comment not found"});
        }
        comment.text = text || comment.text;
        await comment.save();
        res.status(200).json({message: "Comment updated successfully", comment});
    }
    catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
};
