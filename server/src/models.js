import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  shopName: String,
  shopAddress: String,
});

// const InvoiceSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   customerName: String,
//   items: [
//     {
//       name: String,
//       price: Number,
//       qty: Number,
//       discount: Number,
//     },
//   ],
//   total: Number,
//   createdAt: { type: Date, default: Date.now },
// });

export const User = mongoose.model("User", UserSchema);
// export const Invoice = mongoose.model("Invoice", InvoiceSchema);
