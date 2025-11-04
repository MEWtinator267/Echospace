import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import asyncHandler from "express-async-handler";

let io; // will be set from index.js
export const setSocketServer = (serverIO) => {
  io = serverIO;
};

// 1. Send message (UPDATED to handle files)
export const sendMessage = asyncHandler(async (req, res) => {
  // ✅ 1. Destructure the 'file' object from the request body
  const { content, chatId, file } = req.body;

  // ✅ 2. Update validation: A message must have content OR a file
  if ((!content || content.trim() === "") && !file) {
    console.log("Invalid data: No content or file provided");
    return res.sendStatus(400);
  }
  
  if (!chatId) {
    console.log("Invalid data: No chatId provided");
    return res.sendStatus(400);
  }

  const newMessageData = {
    sender: req.user.id,
    content: content || "", // Content can be empty if it's a file-only message
    chat: chatId,
  };

  if (file) {
    newMessageData.file = {
      url: file.url,
      name: file.name,
      mimeType: file.mimeType,
    };
  }

  try {
    let message = await Message.create(newMessageData);

    message = await message.populate("sender", "name email profilePic");
    message = await message.populate({
      path: "chat",
      populate: { path: "users", select: "name email profilePic" },
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    // ✅ EMIT MESSAGE VIA SOCKET
    if (io && message.chat && message.chat._id) {
      const roomId = message.chat._id.toString();
      console.log("🚀 EMITTING MESSAGE:", {
        event: "message received",
        roomId,
        messageId: message._id,
        senderId: message.sender._id,
        content: message.content.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      io.to(roomId).emit("message received", message);
      console.log("✅ MESSAGE EMITTED to room:", roomId);
    } else {
      console.warn("⚠️ SKIPPED EMIT: io or chat._id missing", { io: !!io, chat: !!message.chat, chatId: message.chat?._id });
    }
    
    res.json(message);

  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    chat: req.params.chatId,
    deletedBy: { $ne: req.user.id }, // exclude your deleted ones
  })
    .populate("sender", "name email profilePic")
    .populate({
      path: "chat",
      populate: { path: "users", select: "name email profilePic" },
    });

  res.json(messages);
});

// 3. Delete a Message
export const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.id;

  if (!messageId) {
    return res.status(400).json({ message: "Message ID is required" });
  }

  try {
    const message = await Message.findById(messageId).populate("chat", "users");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // ✅ Only allow the sender to delete their message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    // ✅ Update chat.latestMessage if necessary
    const lastMsg = await Message.findOne({ chat: message.chat._id })
      .sort({ createdAt: -1 })
      .populate("sender", "name email profilePic");

    await Chat.findByIdAndUpdate(message.chat._id, { latestMessage: lastMsg });

    // ✅ Notify other users in that chat (via socket)
    if (io && message.chat._id) {
      io.to(message.chat._id.toString()).emit("message deleted", {
        messageId,
        chatId: message.chat._id.toString(),
      });
    }

    return res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export const softDeleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const userId = req.user.id;

  const message = await Message.findById(messageId);
  if (!message) return res.status(404).json({ message: "Message not found" });

  if (!message.deletedBy.includes(userId)) {
    message.deletedBy.push(userId);
    await message.save();
  }

  res.status(200).json({ success: true, message: "Message deleted for you" });
});
