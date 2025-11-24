import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  amount: { type: Number, required: true },
  roundIndex: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "distributed"], default: "paid" },
  createdAt: { type: Date, default: Date.now }
});

const Contribution = mongoose.model("Contribution", contributionSchema);

export default Contribution;
