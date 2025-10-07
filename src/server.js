import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB();

app.get("/", (req, res) => {
    res.send("Tirlire API is running");
});

app.listen(PORT, () => {
    console.log("Server running on http://localhost:${PORT}");
});

app.use("/users", userRoutes);