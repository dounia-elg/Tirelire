import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export default class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      // const { firstName, lastName, email, password, confirmPassword } = req.body;
      // const response = await fetch('http://localhost:3001/api/v1/auth/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({  firstName, lastName, email, password, confirmPassword })
      // });
      // return res.json(await response.json());

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

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      // const response = await fetch('http://localhost:3001/api/v1/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ email, password })
      // });
      // return res.json(await response.json());
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "1d" }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
