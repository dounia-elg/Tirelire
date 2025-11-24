import Contribution from "../models/Contribution.js";
import Group from "../models/Group.js";
import Payment from "../models/Payment.js";

export default class ContributionController {
  static async contribute(req, res) {
    try {
      const userId = req.user._id;
      const { groupId } = req.params;
      const { amount } = req.body;

      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ success: false, message: "Group not found" });

      // ensure member
      if (!group.members.map(String).includes(String(userId))) {
        return res.status(403).json({ success: false, message: "Only group members can contribute" });
      }

      // amount must match
      if (Number(amount) !== Number(group.amount)) {
        return res.status(400).json({ success: false, message: "Contribution amount mismatch" });
      }

      const contribution = await Contribution.create({ user: userId, group: groupId, amount, roundIndex: group.currentTurn || 0, status: "paid" });

      // create a payment record for transparency
      await Payment.create({ user: userId, amount, currency: "mad", stripePaymentId: null, status: "paid", group: groupId });

      return res.status(201).json({ success: true, contribution });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getGroupContributions(req, res) {
    try {
      const { groupId } = req.params;
      const contributions = await Contribution.find({ group: groupId }).populate("user", "name email");
      res.json({ success: true, contributions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
