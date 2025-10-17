import Notification from "../models/Notification.js";

class NotificationController {
  static async createNotification(userId, message) {
    return await Notification.create({ user: userId, message });
  }

  static async getUserNotifications(req, res) {
    try {
      const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json({ notifications });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      await Notification.findByIdAndUpdate(id, { read: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default NotificationController;
