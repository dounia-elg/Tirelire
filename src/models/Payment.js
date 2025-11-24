import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  stripePaymentId: { type: String },
  status: { type: String, default: "pending" },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
