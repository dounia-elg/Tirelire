import Group from "../models/Group.js";
import User from "../models/User.js";

export default class GroupController {
  static async listAllGroups(req, res) {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const groups = await Group.find({}).populate([
        { path: "creator", select: "name email" },
        { path: "members", select: "name email" }
      ]);

      return res.status(200).json({ success: true, groups });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  
  static async getGroupDetails(req, res) {
    try {
      const group = await Group.findById(req.params.id).populate([
        { path: "creator", select: "name email" },
        { path: "members", select: "name email" }
      ]);

      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }

      return res.status(200).json({ success: true, group });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }


  
  static async create(req, res) {
    try {
      const { name, amount, maxMembers, round } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Group name is required" });
      }
      if (amount == null || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Amount must be > 0" });
      }
      if (maxMembers == null || isNaN(Number(maxMembers)) || Number(maxMembers) <= 0) {
        return res.status(400).json({ success: false, message: "maxMembers must be > 0" });
      }

      
      const roundMap = { semaine: "week", mois: "month", "15jours": "15days" };
      const normalizedRound = roundMap[(round || "").toLowerCase()] || round;
      if (normalizedRound && !["week", "month", "15days"].includes(normalizedRound)) {
        return res.status(400).json({ success: false, message: "round must be one of: week, month, 15days" });
      }

      const creatorId = req.user?._id;
      if (!creatorId) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const group = await Group.create({
        name: name.trim(),
        amount: Number(amount),
        maxMembers: Number(maxMembers),
        round: normalizedRound || undefined,
        creator: creatorId,
        members: [creatorId]
      });

      const populated = await group.populate([
        { path: "creator", select: "name email" },
        { path: "members", select: "name email" }
      ]);

      return res.status(201).json({ success: true, group: populated });
    } catch (error) {
      if (error?.code === 11000 && error?.keyPattern?.name) {
        return res.status(400).json({ success: false, message: "Group name must be unique" });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  }



  
  static async invite(req, res) {
    try {
      const groupId = req.params.id;
      const { emails } = req.body;

      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ success: false, message: "emails must be a non-empty array" });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }

      const requesterId = req.user?._id?.toString();
      if (!requesterId || group.creator.toString() !== requesterId) {
        return res.status(403).json({ success: false, message: "Only the group creator can invite members" });
      }

      
      const users = await User.find({ email: { $in: emails } }).select("_id email");
      const notFound = emails.filter(e => !users.find(u => u.email === e));

      const current = new Set(group.members.map(m => m.toString()));
      const toAdd = [];
      const alreadyMembers = [];

      for (const u of users) {
        const idStr = u._id.toString();
        if (current.has(idStr)) {
          alreadyMembers.push(u.email);
          continue;
        }
        current.add(idStr);
        toAdd.push(u._id);
      }

      if (toAdd.length > 0) {
        group.members.push(...toAdd);
        await group.save();
      }

      const populated = await group.populate([
        { path: "creator", select: "name email" },
        { path: "members", select: "name email" }
      ]);

      return res.status(200).json({
        success: true,
        group: populated,
        added: toAdd.length,
        alreadyMembers,
        notFound
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}


