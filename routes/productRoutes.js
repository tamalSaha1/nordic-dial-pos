const express = require('express');
const router = express.Router();
const {
  getProducts,
  lookupBySku,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/role');

router.use(protect); // both manager and staff can view stock

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/lookup/:sku', lookupBySku);

// Only managers can add/edit/remove products (staff can view + sell, not restructure inventory)
router.post('/', managerOnly, createProduct);
router.put('/:id', managerOnly, updateProduct);
router.delete('/:id', managerOnly, deleteProduct);

module.exports = router;
