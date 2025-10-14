import Group from "../models/Group.js";

export default class GroupController {
  static async create(req, res) {
    try {
      const { name, amount, frequency } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Group name is required" });
      }
      if (amount == null || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Amount must be > 0" });
      }
      if (frequency == null || isNaN(Number(frequency)) || Number(frequency) <= 0) {
        return res.status(400).json({ success: false, message: "Frequency must be > 0" });
      }

      const creatorId = req.user?._id;
      if (!creatorId) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const group = await Group.create({
        name: name.trim(),
        amount: Number(amount),
        frequency: Number(frequency),
        creator: creatorId,
        members: [creatorId]
      });

      return res.status(201).json({ success: true, group });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}


