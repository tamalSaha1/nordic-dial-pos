const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true }, // barcode-style unique code
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // selling price
    costPrice: { type: Number, default: 0, min: 0 }, // supplier/purchase price
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reorderLevel: { type: Number, required: true, default: 10, min: 0 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    imageUrl: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Convenience virtual: is this item currently low on stock?
productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.reorderLevel;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
