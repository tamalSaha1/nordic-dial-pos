const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, getInvoiceById } = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Both manager and staff (cashiers) generate and view invoices - this is the core POS task
router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

module.exports = router;
