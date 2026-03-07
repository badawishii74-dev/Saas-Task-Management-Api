const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");

const { getDashboardStats } = require("../controllers/adminController");
// GET /api/admin/dashboard - Get dashboard stats (admin only)
router.get("/dashboard", protect, getDashboardStats);

module.exports = router;
