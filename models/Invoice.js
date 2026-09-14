const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot of product name at sale time
    sku: { type: String },
    price: { type: Number, required: true }, // unit price at sale time
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, trim: true, default: 'Walk-in Customer' },
    customerPhone: { type: String, trim: true },
    items: { type: [invoiceItemSchema], required: true, validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'mobile_banking'], default: 'cash' },
    paymentStatus: { type: String, enum: ['paid', 'due'], default: 'paid' },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['completed', 'refunded', 'partially_refunded'], default: 'completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
