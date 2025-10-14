import mongoose from "mongoose";

class Group {
  constructor() {
    const groupSchema = new mongoose.Schema(
      {
        name: { type: String, required: true, trim: true, unique: true },
        amount: { type: Number, required: true, min: [1, "Amount must be > 0"] },
        frequency: { type: Number, required: true, min: [1, "Frequency must be > 0"] },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
      },
      { timestamps: true }
    );

    
    groupSchema.index({ name: 1 }, { unique: true });

    this.model = mongoose.models.Group || mongoose.model("Group", groupSchema);
  }

  getModel() {
    return this.model;
  }
}

export default new Group().getModel();


