import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import asyncHandler from "express-async-handler";

let io; // will be set from index.js
export const setSocketServer = (serverIO) => {
  io = serverIO;
};

// 1. Send message
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  console.log("🚀 sendMessage called:", {
    content: content ? `"${content.substring(0, 50)}..."` : 'UNDEFINED',
    chatId,
    userId: req.user?.id, // ✅ Fixed: use req.user.id not req.user._id
    hasIO: !!io
  });

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  // ✅ Check if chat exists before creating message
  const chatExists = await Chat.findById(chatId);
  if (!chatExists) {
    console.error("❌ Chat not found:", chatId);
    return res.status(404).json({ message: "Chat not found" });
  }

  console.log("✅ Chat found:", {
    chatId: chatExists._id,
    usersCount: chatExists.users?.length || 0
  });

  const newMessage = {
    sender: req.user.id, // ✅ Fixed: use req.user.id not req.user._id
    content,
    chat: chatId,
  };

  let message = await Message.create(newMessage);

  try {
    message = await message.populate("sender", "name email profilePic");
    message = await message.populate({
      path: "chat",
      populate: { path: "users", select: "name email profilePic" },
    });
  } catch (populateError) {
    console.error("❌ Population error:", populateError);
    return res.status(500).json({ message: "Failed to populate message data" });
  }

  // ✅ Debug message structure
  console.log("🔍 Message after population:", {
    messageId: message._id,
    content: message.content,
    sender: message.sender ? { id: message.sender._id, name: message.sender.name } : 'UNDEFINED',
    chat: message.chat ? { id: message.chat._id, users: message.chat.users?.length || 0 } : 'UNDEFINED'
  });

  // ✅ Ensure chat exists and update latestMessage safely
  if (message.chat) {
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
  }

  // ✅ Broadcast new message via Socket.IO to chat room - with safe checks
  if (io && message.chat && message.chat._id && message.sender) {
    console.log("📨 Broadcasting message:", {
      messageId: message._id,
      content: message.content,
      senderId: message.sender._id,
      senderName: message.sender.name,
      chatId: message.chat._id,
      chatUsers: message.chat.users?.map(u => ({ id: u._id, name: u.name })) || []
    });
    
    // Test broadcast first
    console.log("🔍 Testing room broadcast to:", message.chat._id.toString());
    console.log("👥 Active rooms:", Array.from(io.sockets.adapter.rooms.keys()));
    console.log("🎯 Room size:", io.sockets.adapter.rooms.get(message.chat._id.toString())?.size || 0);
    
    // Emit to the chat room so all users in that chat receive it
    io.to(message.chat._id.toString()).emit("message received", message);
    console.log("✅ Message broadcasted to chat room:", message.chat._id);
  } else {
    console.error("❌ Cannot broadcast message - missing data:", {
      hasIO: !!io,
      hasChat: !!message.chat,
      hasChatId: !!(message.chat && message.chat._id),
      hasSender: !!message.sender
    });
  }

  res.json(message);
});

// 2. Get all messages
export const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email profilePic")
    .populate({
      path: "chat",
      populate: { path: "users", select: "name email profilePic" },
    });

  res.json(messages);
});
