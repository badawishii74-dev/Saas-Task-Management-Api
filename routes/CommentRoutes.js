const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
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

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Task comments
 */

/**
 * @swagger
 * /api/comments/{taskId}:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string, example: This task needs more details }
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Comment text is required
 *       404:
 *         description: Task not found
 *
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text: { type: string, example: Updated comment text }
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Unauthorized to update this comment
 *       404:
 *         description: Comment not found
 *
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Unauthorized to delete this comment
 *       404:
 *         description: Comment not found
 */