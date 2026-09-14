const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

// @route  GET /api/reports/stock-summary
const getStockSummary = async (req, res) => {
  const products = await Product.find({ active: true });

  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.quantity <= p.reorderLevel).length;
  const outOfStock = products.filter((p) => p.quantity === 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const byCategory = {};
  products.forEach((p) => {
    byCategory[p.category] = (byCategory[p.category] || 0) + p.quantity;
  });

  res.json({ totalProducts, lowStockItems, outOfStock, totalStockValue, byCategory });
};

// @route  GET /api/reports/best-sellers?limit=10
const getBestSellers = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const results = await Invoice.aggregate([
    { $match: { status: { $ne: 'refunded' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        sku: { $first: '$items.sku' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: limit },
  ]);

  res.json(results);
};

// @route  GET /api/reports/revenue?period=daily|weekly|monthly
const getRevenue = async (req, res) => {
  const period = req.query.period || 'daily';
  const now = new Date();
  let startDate;

  if (period === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'monthly') {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
  } else {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0); // today
  }

  const invoices = await Invoice.find({
    createdAt: { $gte: startDate },
    status: { $ne: 'refunded' },
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOrders = invoices.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  // Trend line grouped by day for charting
  const trendMap = {};
  invoices.forEach((inv) => {
    const day = inv.createdAt.toISOString().slice(0, 10);
    trendMap[day] = (trendMap[day] || 0) + inv.total;
  });
  const trend = Object.entries(trendMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  res.json({ period, totalRevenue, totalOrders, avgOrderValue, trend });
};

module.exports = { getStockSummary, getBestSellers, getRevenue };
