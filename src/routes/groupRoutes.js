import express from "express";
import GroupController from "../controllers/groupController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { createStripePayment } from '../controllers/groupController.js';

const router = express.Router();

router.post("/", authenticateToken, GroupController.create);
router.post("/:id/invite", authenticateToken, GroupController.invite);
router.get("/:id", authenticateToken, GroupController.getGroupDetails);
router.get("/", authenticateToken, GroupController.listAllGroups);
router.post('/stripe-payment', createStripePayment);

export default router;


