const express = require('express');
const router = express.Router();
const { createReturn, getReturns, approveReturn, rejectReturn } = require('../controllers/returnController');
const { protect } = require('../middleware/auth');
const { managerOnly } = require('../middleware/role');
const { uploadReturnPhoto } = require('../middleware/upload');

router.use(protect);

// Staff can file a return (goes to 'pending'); managers filing one auto-approves.
// uploadReturnPhoto runs first so req.file / req.body are populated from the
// multipart form before the controller handles the rest of the logic.
router.post('/', uploadReturnPhoto.single('photo'), createReturn);
router.get('/', getReturns);

// Only managers approve/reject pending staff-filed returns
router.put('/:id/approve', managerOnly, approveReturn);
router.put('/:id/reject', managerOnly, rejectReturn);

module.exports = router;
