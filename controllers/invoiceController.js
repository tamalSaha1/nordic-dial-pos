const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const { checkAndTriggerReorder } = require('../utils/autoReorder');

// Generates a human-friendly invoice number like INV-20260913-0001
const generateInvoiceNumber = async () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await Invoice.countDocuments({
    invoiceNumber: { $regex: `^INV-${datePart}` },
  });
  const seq = String(countToday + 1).padStart(4, '0');
  return `INV-${datePart}-${seq}`;
};

// @route  POST /api/invoices   - create invoice, decrement stock, auto-reorder check
const createInvoice = async (req, res) => {
  try {
    const { customerName, customerPhone, items, tax = 0, discount = 0, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'An invoice needs at least one item' });
    }

    const lineItems = [];
    let subtotal = 0;

    // Validate stock and build line items
    for (const line of items) {
      const product = await Product.findById(line.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${line.productId}` });
      }
      if (product.quantity < line.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${product.name}". Available: ${product.quantity}, requested: ${line.quantity}`,
        });
      }

      const lineSubtotal = product.price * line.quantity;
      subtotal += lineSubtotal;

      lineItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: line.quantity,
        subtotal: lineSubtotal,
      });
    }

    const total = subtotal + Number(tax) - Number(discount);
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      items: lineItems,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      cashier: req.user._id,
    });

    // Decrement stock and check auto-reorder for every item sold
    for (const line of lineItems) {
      const product = await Product.findById(line.product);
      product.quantity -= line.quantity;
      await product.save();
      await checkAndTriggerReorder(product._id, 'sale');
    }

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Error creating invoice', error: err.message });
  }
};

// @route  GET /api/invoices?date=&customer=&status=
const getInvoices = async (req, res) => {
  const { date, customer, status } = req.query;
  const filter = {};

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }
  if (customer) filter.customerName = { $regex: customer, $options: 'i' };
  if (status) filter.status = status;

  const invoices = await Invoice.find(filter).populate('cashier', 'name role').sort({ createdAt: -1 });
  res.json(invoices);
};

// @route  GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('cashier', 'name role');
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
};

module.exports = { createInvoice, getInvoices, getInvoiceById };
