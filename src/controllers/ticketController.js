import Ticket from "../models/Ticket.js";
import Group from "../models/Group.js";

export default class TicketController {
  static async createTicket(req, res) {
    try {
      const { subject, description, groupId } = req.body;

      if (!subject || subject.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Subject is required" });
      }

      if (!description || description.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Description is required" });
      }

      // Verify group exists if provided
      if (groupId) {
        const group = await Group.findById(groupId);
        if (!group) {
          return res.status(404).json({ success: false, message: "Group not found" });
        }

        // Verify user is member or creator
        const userId = req.user._id.toString();
        const isMember = group.members.some(m => m.toString() === userId);
        
        if (!isMember && group.creator.toString() !== userId) {
          return res.status(403).json({ success: false, message: "Only group members can create tickets for this group" });
        }
      }

      const ticket = await Ticket.create({
        user: req.user._id,
        group: groupId || null,
        subject: subject.trim(),
        description: description.trim(),
        status: "open"
      });

      const populated = await ticket.populate("user", "name email");

      return res.status(201).json({ success: true, ticket: populated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserTickets(req, res) {
    try {
      const tickets = await Ticket.find({ user: req.user._id })
        .populate("group", "name")
        .populate("assignedAdmin", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, tickets });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTicket(req, res) {
    try {
      const { ticketId } = req.params;

      const ticket = await Ticket.findById(ticketId)
        .populate("user", "name email")
        .populate("group", "name")
        .populate("assignedAdmin", "name email");

      if (!ticket) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
      }

      // Only owner or admin can view
      if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      return res.status(200).json({ success: true, ticket });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listAllTickets(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const { status } = req.query;
      const filter = status ? { status } : {};

      const tickets = await Ticket.find(filter)
        .populate("user", "name email")
        .populate("group", "name")
        .populate("assignedAdmin", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, tickets });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async respondToTicket(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const { ticketId } = req.params;
      const { adminResponse, status } = req.body;

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
      }

      if (adminResponse && adminResponse.trim().length > 0) {
        ticket.adminResponse = adminResponse.trim();
      }

      if (status && ["open", "in_progress", "resolved", "closed"].includes(status)) {
        ticket.status = status;
      }

      ticket.assignedAdmin = req.user._id;
      ticket.updatedAt = new Date();
      await ticket.save();

      const populated = await ticket.populate("user", "name email")
        .populate("group", "name")
        .populate("assignedAdmin", "name email");

      return res.status(200).json({ success: true, ticket: populated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
