import express from "express";
import GroupController from "../controllers/groupController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticateToken, GroupController.create);

export default router;


