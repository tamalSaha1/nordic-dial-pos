const mongoose = require('mongoose');

const reorderRequestSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
    quantityRequested: { type: Number, required: true },
    stockAtTrigger: { type: Number, required: true },
    reorderLevelAtTrigger: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'notified', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    notifiedAt: { type: Date },
    fulfilledAt: { type: Date },
    triggeredBy: { type: String, enum: ['sale', 'return', 'manual'], default: 'sale' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReorderRequest', reorderRequestSchema);
