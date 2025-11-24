import Message from "../models/Message.js";
import Group from "../models/Group.js";
import { authenticateToken } from "../middlewares/auth.js";

export default class MessageController {
  static async sendMessage(req, res) {
    try {
      const { groupId } = req.params;
      const { content, messageType = "text" } = req.body;
      const audioFile = req.file;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }

      const userId = req.user._id.toString();
      const isMember = group.members.some(m => m.toString() === userId);
      
      if (!isMember && group.creator.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Only group members can send messages" });
      }

      if (messageType === "audio" && !audioFile) {
        return res.status(400).json({ success: false, message: "Audio file is required for audio messages" });
      }

      if (messageType === "text" && (!content || content.trim().length === 0)) {
        return res.status(400).json({ success: false, message: "Content is required for text messages" });
      }

      let audioPath = null;
      if (messageType === "audio" && audioFile) {
        // For now, we'll store a reference. In production, encrypt and store securely
        const { saveEncryptedFile } = await import("../utils/fileStorage.js");
        audioPath = await saveEncryptedFile(audioFile.buffer, audioFile.originalname, userId);
      }

      const message = await Message.create({
        group: groupId,
        sender: userId,
        content: content || null,
        audioPath,
        messageType
      });

      const populated = await message.populate("sender", "name email");

      return res.status(201).json({ success: true, message: populated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getGroupMessages(req, res) {
    try {
      const { groupId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }

      const userId = req.user._id.toString();
      const isMember = group.members.some(m => m.toString() === userId);
      
      if (!isMember && group.creator.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Only group members can view messages" });
      }

      const messages = await Message.find({ group: groupId })
        .populate("sender", "name email")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

      return res.status(200).json({ success: true, messages: messages.reverse() });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

