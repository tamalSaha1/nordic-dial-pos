const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierDetail,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/role');

router.use(protect);

router.get('/', getSuppliers);
router.get('/:id', getSupplierDetail);

router.post('/', managerOnly, createSupplier);
router.put('/:id', managerOnly, updateSupplier);
router.delete('/:id', managerOnly, deleteSupplier);

module.exports = router;
