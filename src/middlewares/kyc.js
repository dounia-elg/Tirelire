export const requireKycVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (req.user.kycStatus !== "verified" || !req.user.faceVerified) {
    return res.status(403).json({ success: false, message: "KYC verification required for this action" });
  }

  next();
};

export default { requireKycVerified };
