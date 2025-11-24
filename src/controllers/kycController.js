import User from "../models/User.js";
import fileStorage from "../utils/fileStorage.js";
import faceCompare from "../utils/faceCompare.js";

export default class KYCController {
  static async uploadId(req, res) {
    try {
      const { idNumber } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Save ID number if provided
      if (idNumber) user.idNumber = idNumber;

      // If a file was uploaded (multer memory storage) encrypt & save it
      if (req.file && req.file.buffer) {
        const savedPath = await fileStorage.saveEncryptedFile(req.file.buffer, req.file.originalname, userId.toString());
        user.idImagePath = savedPath;
      }

      // Mark as pending for admin/automatic review
      user.kycStatus = "pending";
      // append audit entry
      if (!Array.isArray(user.kycHistory)) user.kycHistory = [];
      user.kycHistory.push({ action: 'submitted', admin: null, note: null });
      await user.save();

      res.status(200).json({
        success: true,
        message: "KYC data saved successfully",
        kycStatus: user.kycStatus,
        idImagePath: user.idImagePath
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  static async getKYCStatus(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).select('idNumber kycStatus faceVerified');

      res.status(200).json({
        success: true,
        kyc: {
          idNumber: user.idNumber,
          status: user.kycStatus,
          faceVerified: user.faceVerified
        }
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  static async verifyFace(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      // If a selfie file is provided, try to compare with stored ID image
      let faceOk = false;
      if (req.file && req.file.buffer && user.idImagePath) {
        try {
          const idBuffer = await fileStorage.readEncryptedFile(user.idImagePath);
          const selfieBuffer = req.file.buffer;
          faceOk = await faceCompare.compareFaces(idBuffer, selfieBuffer);
        } catch (e) {
          console.warn('Face compare failed, falling back to manual flow', e.message || e);
          faceOk = false;
        }
      } else {
        // no selfie provided: keep legacy behavior (mark true)
        faceOk = true;
      }

      user.faceVerified = !!faceOk;
      if (!Array.isArray(user.kycHistory)) user.kycHistory = [];
      user.kycHistory.push({ action: 'faceVerified', admin: null, note: faceOk ? 'auto-pass' : 'auto-fail' });

      if (faceOk && user.kycStatus === "pending" && user.idNumber) {
        user.kycStatus = "verified";
        user.kycHistory.push({ action: 'approved', admin: null, note: 'auto-approved after face verification' });
      } else if (!faceOk) {
        user.kycStatus = 'rejected';
        user.kycHistory.push({ action: 'rejected', admin: null, note: 'auto-rejected due to face mismatch' });
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: faceOk ? "Face verification successful" : 'Face verification failed',
        faceVerified: user.faceVerified,
        kycStatus: user.kycStatus
      });

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  static async reviewKyc(req, res) {
    try {
      // only admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const targetUserId = req.params.userId;
      const { action, note } = req.body; // action: 'approve'|'reject'

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, message: 'action must be approve or reject' });
      }

      const user = await User.findById(targetUserId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.kycStatus = action === 'approve' ? 'verified' : 'rejected';
      if (!Array.isArray(user.kycHistory)) user.kycHistory = [];
      user.kycHistory.push({ action: action === 'approve' ? 'approved' : 'rejected', admin: req.user._id, note: note || null });
      await user.save();

      return res.status(200).json({ success: true, kycStatus: user.kycStatus });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listPending(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const users = await User.find({ kycStatus: 'pending' }).select('name email idNumber idImagePath createdAt');
      return res.status(200).json({ success: true, pending: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getKycHistoryFor(req, res) {
    try {
      const targetUserId = req.params.userId;
      // owner or admin
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (req.user.role !== 'admin' && req.user._id.toString() !== targetUserId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const user = await User.findById(targetUserId).select('kycHistory name email kycStatus');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      return res.status(200).json({ success: true, user: { name: user.name, email: user.email, kycStatus: user.kycStatus, kycHistory: user.kycHistory } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}