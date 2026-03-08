const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const http = require("http");
const { initSocket } = require("../socket/socketManager");

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const errorHandler = require("../middlewares/errorMiddleware");
// imports at the top
const swaggerUi   = require("swagger-ui-express");
const swaggerSpec = require("../swagger/swaggerConfig");


dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Import routes
const authRoutes = require("../routes/authRoutes");
const taskRoutes = require("../routes/taskRoutes");
const teamRoutes = require("../routes/teamRoutes");
const adminRoutes = require("../routes/adminRoutes");
const commentRoutes = require("../routes/CommentRoutes");
const activityRoutes = require("../routes/activityRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/notifications", notificationRoutes);

console.log("URI:", process.env.MONGO_URI);

const server = http.createServer(app);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server after successful DB connection
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Initialize Socket.io after server is up
      initSocket(server);
      console.log("Socket.io initialized");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Global error handling middleware
app.use(errorHandler);
