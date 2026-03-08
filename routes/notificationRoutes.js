const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
} = require("../controllers/notificationController");

// GET  /api/notifications
router.get("/", protect, getNotifications);

// GET  /api/notifications/unread-count
router.get("/unread-count", protect, getUnreadCount);

// PATCH /api/notifications/read-all  ← must be BEFORE /:id routes
router.patch("/read-all", protect, markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", protect, markAsRead);

// DELETE /api/notifications
router.delete("/", protect, deleteAllNotifications);

// DELETE /api/notifications/:id
router.delete("/:id", protect, deleteNotification);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Return only unread notifications
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:       { type: boolean }
 *                 unreadCount:   { type: integer }
 *                 total:         { type: integer }
 *                 page:          { type: integer }
 *                 pages:         { type: integer }
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *
 *   delete:
 *     summary: Delete all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: All notifications deleted
 */

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:     { type: boolean }
 *                 unreadCount: { type: integer, example: 5 }
 */

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a single notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */