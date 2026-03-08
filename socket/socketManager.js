const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  // ── Auth middleware ──────────────────────────────────────────────
  // Client must connect with: io(URL, { auth: { token: "Bearer <jwt>" } })
  io.use((socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || "";
      const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id; // attach user id to every socket
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection handler ───────────────────────────────────────────
  io.on("connection", (socket) => {
    // Each user joins their own private room named by their userId
    socket.join(socket.userId);
    console.log(`[socket] user ${socket.userId} connected (${socket.id})`);

    socket.on("disconnect", () => {
      console.log(`[socket] user ${socket.userId} disconnected (${socket.id})`);
    });
  });

  return io;
};

// Call this anywhere in your controllers to push to a specific user
const sendNotificationToUser = (userId, notification) => {
  if (!io) {
    console.warn("[socket] io not initialised yet");
    return;
  }
  io.to(userId.toString()).emit("notification", notification);
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialised");
  return io;
};

module.exports = { initSocket, sendNotificationToUser, getIO };
