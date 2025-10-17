import express from "express";
import paymentController from "../controllers/paymentController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();


router.post("/", authenticateToken, paymentController.createStripePayment);

export default router;
