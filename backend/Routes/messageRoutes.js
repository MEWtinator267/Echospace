import express from "express";
import { sendMessage, allMessages } from "../Controllers/messageController.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.post("/", protect, sendMessage);        // send a new message
router.get("/:chatId", protect, allMessages);  // get all messages in a chat
// search a user by their MongoDB ID
router.get("/search/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name profilePic location _id");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error searching user" });
  }
});
router.get("/friends", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friends", "name profilePic _id");
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: "Could not load friends" });
  }
});


export default router;
