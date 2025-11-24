import User from "../models/User.js";
import Group from "../models/Group.js";
import Ticket from "../models/Ticket.js";
import Notification from "../models/Notification.js";

export default class AdminController {
  static async sendMessageToUser(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const { userId } = req.params;
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Message is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Create notification with admin prefix
      const notification = await Notification.create({
        user: userId,
        message: `[Admin] ${message.trim()}`,
        read: false
      });

      return res.status(201).json({ success: true, notification });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async sendMessageToGroup(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const { groupId } = req.params;
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Message is required" });
      }

      const group = await Group.findById(groupId).populate("members");
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }

      // Send notification to all group members
      const notifications = [];
      for (const member of group.members) {
        const notification = await Notification.create({
          user: member._id,
          message: `[Admin - Group: ${group.name}] ${message.trim()}`,
          read: false
        });
        notifications.push(notification);
      }

      return res.status(201).json({ success: true, notifications: notifications.length });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const users = await User.find({})
        .select("name email role trustScore kycStatus faceVerified createdAt")
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserStats(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const { userId } = req.params;

      const user = await User.findById(userId)
        .select("name email role trustScore kycStatus faceVerified createdAt");

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Get user's groups
      const userGroups = await Group.find({ members: userId }).select("name amount round createdAt");

      // Get user's tickets
      const userTickets = await Ticket.find({ user: userId }).select("status subject createdAt");

      // Get user's payments
      const Payment = (await import("../models/Payment.js")).default;
      const userPayments = await Payment.find({ user: userId }).select("amount status createdAt");

      return res.status(200).json({
        success: true,
        user,
        stats: {
          groupsCount: userGroups.length,
          ticketsCount: userTickets.length,
          paymentsCount: userPayments.length,
          totalAmountPaid: userPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
        },
        groups: userGroups,
        tickets: userTickets
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

