import Group from "../models/Group.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

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
      console.error("Distribute error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  
  static async getGroupDetails(req, res) {
    try {
      const group = await Group.findById(req.params.id).populate([
        { path: "creator", select: "name email" },
        { path: "members", select: "name email" },
        { path: "turns", select: "name email" }
      ]);

      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }

      const currentBeneficiary = group.turns?.[group.currentTurn || 0] || null;

      return res.status(200).json({
        success: true,
        group,
        currentBeneficiary,
        nextTurn: group.currentTurn + 1
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }


  
  static async create(req, res) {
    try {
      // Require KYC before creating a group
      if (!req.user || req.user.kycStatus !== "verified" || !req.user.faceVerified) {
        return res.status(403).json({ success: false, message: "KYC verification required to create a group" });
      }

      const { name, amount, maxMembers, round } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Group name is required" });
      }
      if (amount == null || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Amount must be > 0" });
      }
      // maxMembers is optional in some test flows; default to 10 when not provided
      const finalMaxMembers = (maxMembers == null || maxMembers === '') ? 10 : Number(maxMembers);
      if (isNaN(finalMaxMembers) || finalMaxMembers <= 0) {
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
        maxMembers: finalMaxMembers,
        round: normalizedRound || undefined,
        creator: creatorId,
        members: [creatorId]
      });

      // Initialize turns with creator (will be sorted when members are added)
      group.turns = [creatorId];
      
      const now = new Date();
      const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
      const roundToDays = { week: 7, month: 30, "15days": 15 };
      group.nextDate = addDays(roundToDays[group.round || "month"]);
      await group.save();

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
        
        // Sort turns by trustScore (highest first) to influence order
        const allMemberIds = [...group.members];
        const membersWithScores = await User.find({ _id: { $in: allMemberIds } })
          .select("_id trustScore")
          .lean();
        
        const scoreMap = new Map(membersWithScores.map(m => [m._id.toString(), m.trustScore || 0]));
        allMemberIds.sort((a, b) => {
          const scoreA = scoreMap.get(a.toString()) || 0;
          const scoreB = scoreMap.get(b.toString()) || 0;
          return scoreB - scoreA; // Highest score first
        });
        
        group.turns = allMemberIds;
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

  static async distribute(req, res) {
    try {
      const groupId = req.params.id;
      const requesterId = req.user?._id?.toString();

      const group = await Group.findById(groupId).populate('turns members');
      if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

      // only creator or admin
      if (group.creator.toString() !== requesterId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only group creator or admin can distribute funds' });
      }

      const Contribution = (await import('../models/Contribution.js')).default;
      const contributions = await Contribution.find({ group: groupId, roundIndex: group.currentTurn, status: 'paid' });

      console.log('[DISTRIBUTE] contributions found:', contributions.length, 'members:', (group.members||[]).length);

      if (contributions.length < (group.members?.length || 0)) {
        return res.status(400).json({ success: false, message: 'Not all members have paid for this round' });
      }

      // determine beneficiary robustly (support populated or unpopulated turns/members)
      const getId = (val) => {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (val._id) return val._id.toString();
        if (val.id) return val.id.toString();
        try { return val.toString(); } catch (e) { return null; }
      };

      let beneficiaryId = getId(group.turns?.[group.currentTurn]) || getId(group.members?.[group.currentTurn]);
      if (!beneficiaryId) {
        console.log('[DISTRIBUTE] beneficiary not found — turns:', group.turns, 'members:', group.members, 'currentTurn', group.currentTurn);
        return res.status(500).json({ success: false, message: 'Beneficiary not found' });
      }

      console.log('[DISTRIBUTE] beneficiaryId:', beneficiaryId);

      const total = group.amount * (group.members?.length || 1);
      console.log('[DISTRIBUTE] total amount:', total);

      // create payment record for distribution
      const payment = await Payment.create({ user: beneficiaryId, amount: total, currency: 'mad', status: 'completed', group: groupId, beneficiary: beneficiaryId });

      // mark contributions as distributed
      await Contribution.updateMany({ group: groupId, roundIndex: group.currentTurn }, { $set: { status: 'distributed' } });

      // increment beneficiary trust score
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndUpdate(beneficiaryId, { $inc: { trustScore: 5 } });

      // advance turn
      group.currentTurn = ((group.currentTurn || 0) + 1) % (group.turns?.length || group.members?.length || 1);
      // update nextDate based on round
      const now = new Date();
      const roundToDays = { week: 7, month: 30, '15days': 15 };
      const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
      group.nextDate = addDays(roundToDays[group.round || 'month']);
      await group.save();

      return res.json({ success: true, payment });
    } catch (error) {
      console.error('[DISTRIBUTE ERROR]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}



