const Return = require('../models/Return');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

// @route  POST /api/returns   - staff or manager can file a return request
// Expects multipart/form-data (the "uploadReturnPhoto" middleware runs first and
// populates req.file with the uploaded condition photo).
const createReturn = async (req, res) => {
  try {
    const { invoiceId, productId, quantity, reason } = req.body;
    const qty = Number(quantity);

    if (!req.file) {
      return res.status(400).json({ message: 'A photo of the returned item is required so a manager can review its condition' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const lineItem = invoice.items.find((i) => String(i.product) === String(productId));
    if (!lineItem) return res.status(400).json({ message: 'That product was not part of this invoice' });

    if (qty > lineItem.quantity) {
      return res.status(400).json({ message: 'Return quantity exceeds quantity originally sold' });
    }

    const refundAmount = lineItem.price * qty;
    // req.file.buffer holds the raw image bytes (memory storage, not disk) - encode
    // them as a Base64 data URI so the whole image can be stored as one string field
    // directly in the Return document and rendered straight into an <img src="...">
    // on the frontend with no separate file-serving route needed.
    const photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const returnDoc = await Return.create({
      invoice: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      product: productId,
      productName: lineItem.name,
      quantity: qty,
      reason,
      photoUrl,
      refundAmount,
      requestedBy: req.user._id,
      status: req.user.role === 'manager' ? 'approved' : 'pending', // managers can self-approve
    });

    // If already approved (manager filed it), apply stock/invoice adjustments immediately
    if (returnDoc.status === 'approved') {
      await applyApprovedReturn(returnDoc, req.user._id);
    }

    res.status(201).json(returnDoc);
  } catch (err) {
    res.status(500).json({ message: 'Error creating return', error: err.message });
  }
};

// Shared helper: puts stock back and marks invoice/refund state
const applyApprovedReturn = async (returnDoc, processedById) => {
  const product = await Product.findById(returnDoc.product);
  if (product) {
    product.quantity += returnDoc.quantity;
    await product.save();
  }

  const invoice = await Invoice.findById(returnDoc.invoice);
  if (invoice) {
    const fullyReturned = invoice.items.every((i) => i.quantity === returnDoc.quantity);
    invoice.status = fullyReturned ? 'refunded' : 'partially_refunded';
    await invoice.save();
  }

  returnDoc.status = 'approved';
  returnDoc.processedBy = processedById;
  await returnDoc.save();
};

// @route  GET /api/returns
const getReturns = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const returns = await Return.find(filter)
    .populate('requestedBy', 'name role')
    .populate('processedBy', 'name role')
    .sort({ createdAt: -1 });
  res.json(returns);
};

// @route  PUT /api/returns/:id/approve   (manager only) - approve a pending staff-filed return
const approveReturn = async (req, res) => {
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) return res.status(404).json({ message: 'Return request not found' });
  if (returnDoc.status !== 'pending') {
    return res.status(400).json({ message: `This return is already ${returnDoc.status}` });
  }

  await applyApprovedReturn(returnDoc, req.user._id);
  res.json(returnDoc);
};

// @route  PUT /api/returns/:id/reject   (manager only)
const rejectReturn = async (req, res) => {
  const returnDoc = await Return.findById(req.params.id);
  if (!returnDoc) return res.status(404).json({ message: 'Return request not found' });

  returnDoc.status = 'rejected';
  returnDoc.processedBy = req.user._id;
  await returnDoc.save();
  res.json(returnDoc);
};

module.exports = { createReturn, getReturns, approveReturn, rejectReturn };
