import cron from "node-cron";
import Group from "../models/Group.js";
import NotificationController from "../controllers/notificationController.js";

if (process.env.DISABLE_CRON !== 'true') {
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
}
