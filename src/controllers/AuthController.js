import User from "../models/User.js";
import jwt from "jsonwebtoken";

export default class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      const user = await User.create({
        name,
        email,
        password,
        role: role || "particulier",
      });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
      });
    } catch (error) {
      console.error("Register error:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
