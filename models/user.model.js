import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  lastLoginTime: {
    type: String,
    default: null,
  },
  registrationTime: {
    type: String,
    default: null,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

export const User = mongoose.model("User", userSchema);
