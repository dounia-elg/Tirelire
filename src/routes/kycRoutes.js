import express from "express";
import multer from "multer";
import KYCController from "../controllers/kycController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// use memory storage, we'll handle encryption and storage ourselves
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/upload", authenticateToken, upload.single("idImage"), KYCController.uploadId);
router.get("/status", authenticateToken, KYCController.getKYCStatus);
// accept optional `selfie` file to perform automated face-compare
router.post("/verify-face", authenticateToken, upload.single('selfie'), KYCController.verifyFace);
router.post("/review/:userId", authenticateToken, KYCController.reviewKyc);
router.get("/pending", authenticateToken, KYCController.listPending);
router.get("/history/:userId", authenticateToken, KYCController.getKycHistoryFor);

export default router;