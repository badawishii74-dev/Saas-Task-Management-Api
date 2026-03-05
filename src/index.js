const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { protect } = require("./middlewares/authMiddleware");

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Import routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const teamRoutes = require("./routes/teamRoutes");
const userRoutes = require("./routes/userRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/api/protected", protect, (req, res) => {
  res
    .status(200)
    .json({ message: "This is a protected route", user: req.user });
});
app.use("/api/teams", teamRoutes);

console.log("URI:", process.env.MONGO_URI);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server after successful DB connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Global error handling middleware
const errorHandler = require("./middlewares/errorMiddleware");
app.use(errorHandler);
