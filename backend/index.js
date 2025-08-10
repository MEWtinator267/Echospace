import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connect from './models/dbconnect.js';
import AccessLogic from './Routes/AccessRoute.js';
import messageRoutes from './Routes/messageRoutes.js';
import friendRoutes from './Routes/friendRoutes.js';
import notificationRoutes from './Routes/notificationRoutes.js'
import chatRoutes from './Routes/Chatroutes.js'

dotenv.config();
connect();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

app.use('/auth', AccessLogic);
app.use('/api/message', messageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chat", chatRoutes);
app.use('/api/notifications', notificationRoutes);


// Create HTTP server for socket.io
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173", // change if your frontend URL is different
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  // Join personal room
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("User joined room:", userData._id);
    socket.emit("connected");
  });

  // Join chat room
  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log("User joined chat room:", roomId);
  });

  // Typing indicator
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // New message received
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // Disconnect cleanup
  socket.off("setup", () => {
    console.log("❌ User disconnected");
    socket.leave(socket.id);
  });
});

// Start server with socket
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
