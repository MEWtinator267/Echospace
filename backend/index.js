import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connect from "./models/dbconnect.js";

// Routes
import AccessLogic from "./Routes/AccessRoute.js";
import messageRoutes from "./Routes/messageRoutes.js";
import friendRoutes from "./Routes/friendRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
import chatRoutes from "./Routes/Chatroutes.js";

dotenv.config();
connect();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API Routes
app.use("/auth", AccessLogic);
app.use("/api/message", messageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user", friendRoutes); // ⚠️ might be duplicate of /api/friends

// Create HTTP server for socket.io
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173", // ✅ frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  // Join personal room (for notifications, DMs, etc.)
  socket.on("setup", (userData) => {
    if (!userData?._id) return;
    socket.join(userData._id);
    socket.emit("connected");
    console.log("✅ User joined personal room:", userData._id);
  });

  // Join chat room
  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log("📌 User joined chat room:", roomId);
  });

  // Typing indicators
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // Handle new message
  socket.on("new message", (newMessageReceived) => {
    try {
      if (!newMessageReceived?.chat) {
        console.log("❌ Chat not defined in message");
        return;
      }

      const chat = newMessageReceived.chat;

      if (!chat.users || chat.users.length === 0) {
        console.log("❌ No users found in chat");
        return;
      }

      chat.users.forEach((user) => {
        if (!user?._id || !newMessageReceived?.sender?._id) return;

        // Skip sender
        if (user._id.toString() === newMessageReceived.sender._id.toString())
          return;

        // Emit to other users
        socket.in(user._id.toString()).emit("message received", newMessageReceived);
      });
    } catch (err) {
      console.error("🔥 Socket error in new message:", err);
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
