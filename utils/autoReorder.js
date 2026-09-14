const Product = require('../models/Product');
const ReorderRequest = require('../models/ReorderRequest');

/**
 * Checks a single product after a stock-changing event (sale, return, manual edit).
 * If quantity has fallen to or below reorderLevel, and there is no existing
 * pending/notified request for it already, creates a new reorder request and
 * "notifies" the supplier (simulated - logs + timestamps the notification).
 */
const checkAndTriggerReorder = async (productId, triggeredBy = 'sale') => {
  const product = await Product.findById(productId).populate('supplier');
  if (!product) return null;

  if (product.quantity > product.reorderLevel) return null; // stock is healthy, nothing to do

  // Avoid duplicate open requests for the same product
  const existingOpenRequest = await ReorderRequest.findOne({
    product: product._id,
    status: { $in: ['pending', 'notified'] },
  });
  if (existingOpenRequest) return existingOpenRequest;

  // Simple reorder quantity heuristic: bring stock back up to 3x the reorder level
  const quantityRequested = Math.max(product.reorderLevel * 3 - product.quantity, product.reorderLevel);

  const reorderRequest = await ReorderRequest.create({
    product: product._id,
    productName: product.name,
    supplier: product.supplier ? product.supplier._id : undefined,
    supplierName: product.supplier ? product.supplier.name : 'No supplier assigned',
    quantityRequested,
    stockAtTrigger: product.quantity,
    reorderLevelAtTrigger: product.reorderLevel,
    status: 'notified',
    notifiedAt: new Date(),
    triggeredBy,
  });

  // Simulated supplier notification (in a real system this would send an email/SMS/API call)
  console.log(
    `[AUTO-REORDER] ${product.name} (SKU: ${product.sku}) hit ${product.quantity}/${product.reorderLevel}. ` +
      `Reorder request sent to ${reorderRequest.supplierName} for ${quantityRequested} units.`
  );

  return reorderRequest;
};

module.exports = { checkAndTriggerReorder };
