import express from "express";
import { sendMessage, allMessages ,deleteMessage,softDeleteMessage } from "../Controllers/messageController.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.post("/", protect, sendMessage);        // send a new message
router.get("/:chatId", protect, allMessages);  // get all messages in a chat
router.route("/:id").delete(protect, deleteMessage);
router.route("/soft/:messageId").put(protect, softDeleteMessage);

export default router;
