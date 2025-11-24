import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    adminResponse: { type: String, default: null },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

ticketSchema.index({ user: 1, createdAt: -1 });
ticketSchema.index({ status: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;

