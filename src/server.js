import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import kycRoutes from "./routes/kycRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

dotenv.config();
connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/kyc", kycRoutes);

app.use("/api/groups", groupRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
