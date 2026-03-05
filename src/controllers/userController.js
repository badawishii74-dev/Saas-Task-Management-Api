const User = require("../models/User");

// get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only ..!" });
  }

  const users = User.find().select("-password");

  res.status(200).json({
    success: true,
    users,
  });
};
