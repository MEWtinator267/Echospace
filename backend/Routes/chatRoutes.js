import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup
} from "../Controllers/chatController.js"; // 
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.post("/", protect, accessChat); // one-to-one
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/groupadd", protect, addToGroup);
router.put("/groupremove", protect, removeFromGroup);

export default router;
