const ReorderRequest = require('../models/ReorderRequest');
const { checkAndTriggerReorder } = require('../utils/autoReorder');

// @route  GET /api/reorders
const getReorderRequests = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const requests = await ReorderRequest.find(filter).sort({ createdAt: -1 });
  res.json(requests);
};

// @route  POST /api/reorders/check/:productId  - manually trigger a check (also runs automatically after sales)
const manualCheck = async (req, res) => {
  const result = await checkAndTriggerReorder(req.params.productId, 'manual');
  if (!result) {
    return res.json({ message: 'Stock is above reorder level - no reorder needed' });
  }
  res.json(result);
};

// @route  PUT /api/reorders/:id/fulfill   (manager only) - mark stock as received from supplier
const fulfillReorder = async (req, res) => {
  const request = await ReorderRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Reorder request not found' });

  request.status = 'fulfilled';
  request.fulfilledAt = new Date();
  await request.save();

  res.json(request);
};

module.exports = { getReorderRequests, manualCheck, fulfillReorder };
