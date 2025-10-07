import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    role: { type: String, default: "particulier" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);