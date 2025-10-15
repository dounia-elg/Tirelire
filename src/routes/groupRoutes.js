import express from "express";
import GroupController from "../controllers/groupController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticateToken, GroupController.create);
router.post("/:id/invite", authenticateToken, GroupController.invite);
router.get("/:id", authenticateToken, GroupController.getGroupDetails);

export default router;


