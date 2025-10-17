import express from "express";
import NotificationController from "../controllers/notificationController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();


router.get("/", authenticateToken, NotificationController.getUserNotifications);
router.patch("/:id/read", authenticateToken, NotificationController.markAsRead);

export default router;
