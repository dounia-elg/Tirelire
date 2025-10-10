import mongoose from "mongoose";

class User {
  constructor() {
    const userSchema = new mongoose.Schema(
      {
        name: {
          type: String,
          required: [true, "Name is required"],
         
        },
        email: {
          type: String,
          required: [true, "Email is required"],
          unique: true,
          match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email address",
          ],
        },
        password: {
          type: String,
          required: [true, "Password is required"],
          minlength: [6, "Password must be at least 6 characters long"],
          
        },
        role: {
          type: String,
          enum: ["particulier", "admin"],
          default: "particulier",
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
      { timestamps: true }
    );

    this.model = mongoose.models.User || mongoose.model("User", userSchema);
  }

  getModel() {
    return this.model;
  }
}

export default new User().getModel();
