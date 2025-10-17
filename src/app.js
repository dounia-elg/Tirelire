import express from "express";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import kycRoutes from "./routes/kycRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


const app = express();

app.use(express.json());


app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});


app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/contributions", paymentRoutes);
app.use("/api/notifications", notificationRoutes);




export default app;


