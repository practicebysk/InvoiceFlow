import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  shopName: String,
  shopAddress: String,
});

export const User = mongoose.model("User", UserSchema);
