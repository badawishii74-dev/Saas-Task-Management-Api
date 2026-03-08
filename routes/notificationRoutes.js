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
