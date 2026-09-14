const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const ReorderRequest = require('../models/ReorderRequest');

// @route  GET /api/suppliers
const getSuppliers = async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 });
  res.json(suppliers);
};

// @route  GET /api/suppliers/:id  - includes products supplied + reorder history
const getSupplierDetail = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  const products = await Product.find({ supplier: supplier._id });
  const orderHistory = await ReorderRequest.find({ supplier: supplier._id }).sort({ createdAt: -1 });

  res.json({ supplier, products, orderHistory });
};

// @route  POST /api/suppliers     (manager only)
const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Error creating supplier', error: err.message });
  }
};

// @route  PUT /api/suppliers/:id  (manager only)
const updateSupplier = async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  res.json(supplier);
};

// @route  DELETE /api/suppliers/:id (manager only)
const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  await supplier.deleteOne();
  res.json({ message: 'Supplier removed' });
};

module.exports = { getSuppliers, getSupplierDetail, createSupplier, updateSupplier, deleteSupplier };
