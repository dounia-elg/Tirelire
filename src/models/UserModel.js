import mongoose from "mongoose";

class UserModel {
  constructor() {
    const userSchema = new mongoose.Schema(
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
        },

        password: {
          type: String,
          required: true,
          minlength: 6,
        },

        role: {
          type: String,
          enum: ["Particulier", "Admin"],
          default: "Particulier", 
        },

        verified: {
          type: Boolean,
          default: false,
        },
      },
      { timestamps: true }
    );

    this.model = mongoose.model("User", userSchema);
  }

  async createUser(data) {
    const user = new this.model(data);
    return await user.save();
  }

  async getAllUsers(){
    return await this.model.find();
  }

  async getUserByEmail(){
    return await this.model.findOne({ email });
  }

}

export default new UserModel();