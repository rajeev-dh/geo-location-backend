import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      required: "Name is required",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      required: "Your email is required",
      trim: true,
    },
    password: {
      type: String,
      required: true,
      required: "Your password is required",
      max: 100,
    },
    profileImage: {
      type: String,
      required: false,
      max: 255,
    },
    registrationNo: {
      type: String,
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: ["student"],
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
