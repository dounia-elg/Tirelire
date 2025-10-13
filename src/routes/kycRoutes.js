import express from "express";
import KYCController from "../controllers/kycController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();


router.post("/upload", authenticateToken, KYCController.uploadId);
router.get("/status", authenticateToken, KYCController.getKYCStatus);
router.post("/verify-face", authenticateToken, KYCController.verifyFace);

export default router;