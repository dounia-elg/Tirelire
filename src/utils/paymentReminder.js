import cron from "node-cron";
import Group from "../models/Group.js";
import Contribution from "../models/Contribution.js";
import User from "../models/User.js";
import NotificationController from "../controllers/notificationController.js";

if (process.env.DISABLE_CRON !== 'true') {
  // Daily reminder at 8 AM
  cron.schedule("0 8 * * *", async () => {
    try {
      const now = new Date();
      const soon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const groups = await Group.find({ nextDate: { $gte: now, $lte: soon } }).populate("members");

      for (const group of groups) {
        for (const member of group.members) {
          await NotificationController.createNotification(
            member._id,
            `Reminder: Your group "${group.name}" has a payment due soon!`
          );
        }
      }
    } catch (error) {
      console.error("[CRON] Error sending payment reminders:", error);
    }
  });

  // Daily check for late payments (runs at 9 AM, after reminder)
  cron.schedule("0 9 * * *", async () => {
    try {
      const now = new Date();
      // Find groups where payment is overdue (nextDate < now)
      const overdueGroups = await Group.find({ nextDate: { $lt: now } }).populate("members");

      for (const group of overdueGroups) {
        // Get contributions for current round
        const contributions = await Contribution.find({
          group: group._id,
          roundIndex: group.currentTurn || 0,
          status: { $in: ["pending", "paid"] }
        });

        const paidMemberIds = new Set(contributions.map(c => c.user.toString()));

        // Find members who haven't paid
        for (const member of group.members) {
          const memberId = member._id.toString();
          
          if (!paidMemberIds.has(memberId)) {
            // Apply penalty for late payment
            await User.findByIdAndUpdate(memberId, { $inc: { trustScore: -2 } });
            
            await NotificationController.createNotification(
              member._id,
              `Warning: Late payment penalty applied. Your trust score has been decreased due to late payment in group "${group.name}".`
            );
          }
        }
      }
    } catch (error) {
      console.error("[CRON] Error checking late payments:", error);
    }
  });
}
