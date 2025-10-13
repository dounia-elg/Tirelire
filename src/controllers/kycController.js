import User from "../models/User.js";

export default class KYCController {
  static async uploadId(req, res) {
    try {
      const { idNumber } = req.body;
      const userId = req.user._id;

      if (!idNumber) {
        return res.status(400).json({
          success: false,
          message: "ID number is required"
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      
      user.idNumber = idNumber;
      user.kycStatus = "pending";
      await user.save();

      res.status(200).json({
        success: true,
        message: "ID number saved successfully",
        kycStatus: user.kycStatus
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

      
      user.faceVerified = true;
      if (user.kycStatus === "pending" && user.idNumber) {
        user.kycStatus = "verified";
      }
      await user.save();

      res.status(200).json({
        success: true,
        message: "Face verification successful",
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
}