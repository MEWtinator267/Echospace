import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connect from "./models/dbconnect.js";


import AccessLogic from "./Routes/AccessRoute.js";
import messageRoutes from "./Routes/messageRoutes.js";
import friendRoutes from "./Routes/friendRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import uploadRoutes from "./Routes/uploadRoutes.js";

import { setSocketServer } from "./Controllers/messageController.js";

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
app.use('/api/upload', uploadRoutes);
app.use('/api/upload', uploadRoutes);


const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:4173", "http://localhost:3000", "https://echospace-frontend.onrender.com"], // ✅ Allow localhost dev and deployed frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setSocketServer(io);

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData?._id) return;
    socket.join(userData._id);
    socket.emit("connected");
    console.log("👤 User joined personal room:", userData._id, "| Socket ID:", socket.id);
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log("📌 Socket", socket.id, "joined chat room:", roomId);
    console.log("   Room members count:", io.sockets.adapter.rooms.get(roomId)?.size || 0);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room);
    console.log("👀 User typing in room:", room);
  });
  
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
    console.log("User stopped typing in room:", room);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  // ✅ Handle message deletion event
  socket.on("message deleted", ({ messageId, chatId }) => {
    io.to(chatId).emit("message deleted", { messageId, chatId });
  });
  socket.on("chat deleted", ({ chatId }) => {
    io.to(chatId).emit("chat deleted", { chatId });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io };
