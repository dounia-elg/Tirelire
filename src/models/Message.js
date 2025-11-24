import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true },
    audioPath: { type: String, default: null },
    messageType: { type: String, enum: ["text", "audio"], default: "text", required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

messageSchema.index({ group: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;

