const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { createComment, getTaskComments, deleteComment, updateComment } = require('../controllers/commentController');

// Create a new comment
router.post('/:taskId', protect, createComment);

// Get all comments for a specific task
router.get('/:taskId', protect, getTaskComments);

// Update a comment
router.put('/:commentId', protect, updateComment);

// Delete a comment
router.delete('/:commentId', protect, deleteComment);

module.exports = router;