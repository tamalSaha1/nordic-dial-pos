const express = require('express');
const router = express.Router();
const { createReturn, getReturns, approveReturn, rejectReturn } = require('../controllers/returnController');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/role');

router.use(protect);

// Staff can file a return (goes to 'pending'); managers filing one auto-approves
router.post('/', createReturn);
router.get('/', getReturns);

// Only managers approve/reject pending staff-filed returns
router.put('/:id/approve', managerOnly, approveReturn);
router.put('/:id/reject', managerOnly, rejectReturn);

module.exports = router;
