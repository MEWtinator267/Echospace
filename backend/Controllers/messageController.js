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

  let message = await Message.create(newMessage);

  message = await message.populate("sender", "name email");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name email",
  });

  // update latest message in chat
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  res.json(message);
});

// 2. Get all messages in a chat
export const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email")
    .populate("chat");

  res.json(messages);
});
