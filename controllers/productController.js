const Product = require('../models/Product');

// @route  GET /api/products?category=&search=&lowStock=true
const getProducts = async (req, res) => {
  const { category, search, lowStock } = req.query;
  const filter = { active: true };

  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  let products = await Product.find(filter).populate('supplier', 'name').sort({ name: 1 });

  if (lowStock === 'true') {
    products = products.filter((p) => p.quantity <= p.reorderLevel);
  }

  res.json(products);
};

// @route  GET /api/products/lookup/:sku  - fast barcode-style lookup for POS scanning
const lookupBySku = async (req, res) => {
  const product = await Product.findOne({ sku: req.params.sku.toUpperCase(), active: true });
  if (!product) return res.status(404).json({ message: 'No product found with that code' });
  res.json(product);
};

// @route  GET /api/products/categories - distinct list for the category tabs
const getCategories = async (req, res) => {
  const categories = await Product.distinct('category', { active: true });
  res.json(categories);
};

// @route  POST /api/products    (manager only)
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

// @route  PUT /api/products/:id  (manager only)
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// @route  DELETE /api/products/:id (manager only) - soft delete to preserve invoice history
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.active = false;
  await product.save();
  res.json({ message: 'Product removed' });
};

module.exports = {
  getProducts,
  lookupBySku,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
