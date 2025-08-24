import Chat from "../models/Chat.js";
import AllUser from "../models/users.js"; // ✅ Correct import name
import Message from "../models/Message.js";
import asyncHandler from "express-async-handler";

// 1. One-to-One Chat Access / Create
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send("UserId param not sent");

  console.log("🔍 accessChat called:", {
    requestingUserId: req.user.id, // ✅ Fixed: use req.user.id
    targetUserId: userId
  });

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user.id, userId] }, // ✅ Fixed: use req.user.id
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (chat) {
      console.log("✅ Existing chat found:", chat._id);
      chat = await AllUser.populate(chat, {
        path: "latestMessage.sender",
        select: "name email",
      });
      return res.status(200).json(chat);
    }

    console.log("🆕 Creating new chat between users:", req.user.id, "and", userId);

    // If no chat, create new
    const newChatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId], // ✅ Fixed: use req.user.id
    };

    const createdChat = await Chat.create(newChatData);
    const fullChat = await Chat.findById(createdChat._id).populate(
      "users",
      "-password"
    );

    console.log("✅ New chat created:", fullChat._id);
    return res.status(200).json(fullChat);
  } catch (err) {
    console.error("Error in accessChat:", err);
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
});

// 2. Fetch all chats for logged-in user
export const fetchChats = asyncHandler(async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user.id } }, // ✅ Fixed: use req.user.id
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await AllUser.populate(chats, {
      path: "latestMessage.sender",
      select: "name email",
    });

    return res.status(200).json(chats);
  } catch (err) {
    console.error("Error in fetchChats:", err);
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
});

// 3. Create Group Chat
export const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).send("Please fill all the fields");
  }

  try {
    const parsedUsers = Array.isArray(users) ? users : JSON.parse(users);

    if (parsedUsers.length < 2) {
      return res
        .status(400)
        .send("Group should have at least 3 people including you");
    }

    parsedUsers.push(req.user.id); // ✅ Fixed: use req.user.id

    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user.id, // ✅ Fixed: use req.user.id
    });

    const fullGroup = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroup);
  } catch (err) {
    console.error("Error in createGroupChat:", err);
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
});

// 4. Rename Group
export const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) return res.status(404).send("Chat not found");

    return res.json(updatedChat);
  } catch (err) {
    console.error("Error in renameGroup:", err);
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
});

// 5. Add user to group
export const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) return res.status(404).send("Chat not found");

    return res.json(updatedChat);
  } catch (err) {
    console.error("Error in addToGroup:", err);
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
});

// 6. Remove user from group
export const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) return res.status(404).send("Chat not found");

    return res.json(updatedChat);
  } catch (err) {
    console.error("Error in removeFromGroup:", err);
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
});
