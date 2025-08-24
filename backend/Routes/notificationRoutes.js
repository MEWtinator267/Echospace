import express from "express";
import { protect } from "../Middleware/auth.js";
import { getNotifications, deleteNotification } from "../Controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.delete("/:id", protect, deleteNotification);

export default router;
