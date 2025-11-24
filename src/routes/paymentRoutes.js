import express from "express";
import paymentController from "../controllers/paymentController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();



router.post("/", authenticateToken, paymentController.createStripePayment);
router.get("/history", authenticateToken, paymentController.getPaymentHistory);
router.get("/group/:groupId/history", authenticateToken, paymentController.getGroupPaymentHistory);
router.post('/group/:groupId/contribute', authenticateToken, (await import('../controllers/contributionController.js')).default.contribute);
router.get('/group/:groupId', authenticateToken, (await import('../controllers/contributionController.js')).default.getGroupContributions);

export default router;
