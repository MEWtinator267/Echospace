// routes/friendRoutes.js

import express from "express";
import { sendFriendRequest, acceptFriendRequest } from "../controllers/friendController.js";
import { protect } from "../Middleware/auth.js";
import { rejectFriendRequest } from "../controllers/friendController.js";
import { searchUsers } from "../controllers/friendController.js";

const router = express.Router();

router.post("/send", protect, sendFriendRequest);
router.post("/accept", protect, acceptFriendRequest);
router.post("/reject", protect, rejectFriendRequest);
router.get("/search", protect, searchUsers);

export default router;
