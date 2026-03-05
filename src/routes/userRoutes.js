const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get("/", protect, getAllUsers);


module.exports = router;