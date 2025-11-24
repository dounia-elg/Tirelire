import express from "express";
import MessageController from "../controllers/messageController.js";
import { authenticateToken } from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/group/:groupId", authenticateToken, upload.single("audio"), MessageController.sendMessage);
router.get("/group/:groupId", authenticateToken, MessageController.getGroupMessages);

export default router;

