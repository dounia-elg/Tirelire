
import Payment from "../models/Payment.js";
import NotificationController from "./notificationController.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class paymentController {
  static async createStripePayment(req, res) {
    try {
      const { amount, currency = "mad" } = req.body;
      // simple KYC enforcement: block payments from unverified users
      if (!req.user || req.user.kycStatus !== "verified" || !req.user.faceVerified) {
        return res.status(403).json({ success: false, message: "KYC verification required to make payments" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
      });

      
      const payment = await Payment.create({
        user: req.user._id,
        amount,
        currency,
        stripePaymentId: paymentIntent.id,
        status: paymentIntent.status || "pending"
      });

      // increment simple trustScore on successful payment record creation
      try {
        const User = (await import("../models/User.js")).default;
        await User.findByIdAndUpdate(req.user._id, { $inc: { trustScore: 1 } });
      } catch (err) {
        console.warn("Failed to update trustScore:", err.message);
      }

      
      await NotificationController.createNotification(
        req.user._id,
        `Payment of ${amount} ${currency} created. Status: ${payment.status}`
      );

      res.json({ clientSecret: paymentIntent.client_secret, paymentId: payment._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      
      const payments = await Payment.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "name email" })
        .populate({ path: "group", select: "name" })
        .populate({ path: "beneficiary", select: "name email" });
      res.json({ payments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getGroupPaymentHistory(req, res) {
    try {
      const { groupId } = req.params;

      // Verify user is member of the group
      const Group = (await import("../models/Group.js")).default;
      const group = await Group.findById(groupId);
      
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }

      const userId = req.user._id.toString();
      const isMember = group.members.some(m => m.toString() === userId);
      
      if (!isMember && group.creator.toString() !== userId && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only group members can view payment history" });
      }

      // Get all payments for this group (contributions and distributions)
      const payments = await Payment.find({ group: groupId })
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "name email" })
        .populate({ path: "beneficiary", select: "name email" });

      return res.status(200).json({ success: true, payments });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default paymentController;
