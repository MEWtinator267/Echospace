import Message from "../models/Message.js";
import User from "../models/users.js";
import Chat from "../models/Chat.js";
import asyncHandler from "express-async-handler";

// 1. Send message
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  // ✅ Create the message
  let message = await Message.create(newMessage);

  // ✅ Refetch with full population (important for socket)
  message = await Message.findById(message._id)
    .populate("sender", "name email profilePic")   // make sure to match your User model field (use `profilePic` not `pic`)
    .populate({
      path: "chat",
      populate: {
        path: "users",
        select: "name email profilePic",           // all users in the chat
      },
    });

  // ✅ Update latest message in chat
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  res.json(message);
});

// 2. Get all messages in a chat
export const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email profilePic")
    .populate({
      path: "chat",
      populate: { path: "users", select: "name email profilePic" },
    });

  res.json(messages);
});
