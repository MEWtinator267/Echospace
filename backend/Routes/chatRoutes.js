import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  deleteChat,
  softDeleteChat,
  updateGroup,
  leaveGroup
} from "../Controllers/chatController.js"; // 
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.post("/", protect, accessChat); // one-to-one
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/groupadd", protect, addToGroup);
router.put("/groupremove", protect, removeFromGroup);
router.delete("/:id", protect, deleteChat);
router.route("/soft/:chatId").put(protect, softDeleteChat);
router.route("/group/:chatId").put(protect, updateGroup);
router.route("/group/leave/:chatId").put(protect, leaveGroup);


export default router;
