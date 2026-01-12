import mongoose from "mongoose";

function twoDecimal(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true, required: true },
  customer: { name: { type: String, required: true }, due_date: { type: Date, default: Date.now }, status: { type: String, default: 'Pending' }, },
  items: [
    {
      product: String,
      price: { type: Number, default: 0, set: twoDecimal },
      qty: Number,
      discount: { type: Number, default: 0, set: twoDecimal }
    },
  ],
  commonDiscount: { type: Number, default: 0, set: twoDecimal },
  gstType: { type: String, enum: ['CGST_SGST', 'IGST', 'NONE'], default: 'CGST_SGST' },
  gstRate: { type: Number, default: 0, set: twoDecimal },
  advancePaid: { type: Number, default: 0, set: twoDecimal },
  totals: {
    taxableAmount: { type: Number, required: true, set: twoDecimal },
    gstAmount: { type: Number, required: true, set: twoDecimal },
    grandTotal: { type: Number, required: true, set: twoDecimal },
    balanceDue: { type: Number, required: true, set: twoDecimal }
  },
  extraCharge: {
    label: { type: String },
    amount: { type: Number, default: 0, set: twoDecimal }
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  }
});

// ✅ prevents OverwriteModelError
export const Invoice = mongoose.model("Invoice", invoiceSchema);
