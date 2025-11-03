// routes/friendRoutes.js

import express from "express";
import { sendFriendRequest, acceptFriendRequest,rejectFriendRequest,searchUsers,getFriendsList, getFriendCount,removeFriend } from "../Controllers/friendController.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.post("/send", protect, sendFriendRequest);
router.post("/accept", protect, acceptFriendRequest);
router.post("/reject", protect, rejectFriendRequest);
router.get("/search", protect, searchUsers);
router.get("/count",protect,getFriendCount);
router.get("/list", protect, getFriendsList);
router.delete("/remove/:friendId", protect, removeFriend);


export default router;
