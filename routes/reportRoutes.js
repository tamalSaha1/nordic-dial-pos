const express = require('express');
const router = express.Router();
const { getStockSummary, getBestSellers, getRevenue } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/role');

router.use(protect);

// Staff can see stock levels and what's selling well - useful on the shop floor
router.get('/stock-summary', getStockSummary);
router.get('/best-sellers', getBestSellers);

// Revenue/financial figures are manager-only
router.get('/revenue', managerOnly, getRevenue);

module.exports = router;
