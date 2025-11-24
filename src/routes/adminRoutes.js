import express from "express";
import AdminController from "../controllers/adminController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/users/:userId/message", authenticateToken, AdminController.sendMessageToUser);
router.post("/groups/:groupId/message", authenticateToken, AdminController.sendMessageToGroup);
router.get("/users", authenticateToken, AdminController.getAllUsers);
router.get("/users/:userId/stats", authenticateToken, AdminController.getUserStats);

export default router;

