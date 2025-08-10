import Chat from "../models/Chat.js";
import User from "../models/users.js";
import Message from "../models/Message.js";
import asyncHandler from "express-async-handler";

// 1. One-to-One Chat Access / Create
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).send("UserId param not sent");

  // Check if chat already exists between logged-in user and target user
  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] }
  }).populate("users", "-password").populate("latestMessage");

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "name email",
  });

  if (chat) {
    return res.status(200).json(chat);
  }

  // If no chat, create new
  const newChatData = {
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  };

  const createdChat = await Chat.create(newChatData);
  const fullChat = await Chat.findById(createdChat._id).populate("users", "-password");

  res.status(200).json(fullChat);
});

// 2. Fetch all chats for logged-in user
export const fetchChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  // populate sender inside latestMessage
  const fullChats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name email",
  });

  res.status(200).json(fullChats);
});

// 3. Create Group Chat
export const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).send("Please fill all the fields");
  }

  const parsedUsers = JSON.parse(users); // frontend sends JSON string

  if (parsedUsers.length < 2) {
    return res.status(400).send("Group should have at least 3 people including you");
  }

  parsedUsers.push(req.user); // add the logged-in user

  const groupChat = await Chat.create({
    chatName: name,
    users: parsedUsers,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  const fullGroup = await Chat.findById(groupChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullGroup);
});

// 4. Rename Group
export const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(404).send("Chat not found");
  }

  res.json(updatedChat);
});

// 5. Add user to group
export const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } }, // avoids duplicates
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) return res.status(404).send("Chat not found");

  res.json(updatedChat);
});

// 6. Remove user from group
export const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) return res.status(404).send("Chat not found");

  res.json(updatedChat);
});