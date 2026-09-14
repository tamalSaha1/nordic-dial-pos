const express = require('express');
const router = express.Router();
const { getReorderRequests, manualCheck, fulfillReorder } = require('../controllers/reorderController');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/role');

router.use(protect);

router.get('/', getReorderRequests); // both roles can see reorder status
router.post('/check/:productId', manualCheck);
router.put('/:id/fulfill', managerOnly, fulfillReorder); // only manager confirms stock received

module.exports = router;
