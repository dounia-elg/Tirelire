import mongoose from "mongoose";

class Group {
  constructor() {
    const groupSchema = new mongoose.Schema(
      {
        name: { type: String, required: true, trim: true, unique: true },
        amount: { type: Number, required: true, min: [1, "Amount must be > 0"] },
        round: { type: String, enum: ["week", "month", "15days"], default: "month" },
        maxMembers: { type: Number, required: true, min: [1, "maxMembers must be > 0"] },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        turns: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        currentTurn: { type: Number, default: 0 },
        nextDate: { type: Date }
      },
      { timestamps: true }
    );

    

    this.model = mongoose.models.Group || mongoose.model("Group", groupSchema);
  }

  getModel() {
    return this.model;
  }
}

export default new Group().getModel();


