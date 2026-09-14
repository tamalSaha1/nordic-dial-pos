// Run with: npm run seed
// Creates one manager account, one staff account, a supplier, and a few sample products.
// Safe to run once on a fresh database.

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');

const run = async () => {
  await connectDB();

  console.log('Seeding database...');

  const managerExists = await User.findOne({ email: 'manager@nordicdial.com' });
  if (!managerExists) {
    await User.create({
      name: 'Store Manager',
      email: 'manager@nordicdial.com',
      password: 'Manager@123',
      role: 'manager',
    });
    console.log('Created manager account: manager@nordicdial.com / Manager@123');
  }

  const staffExists = await User.findOne({ email: 'staff@nordicdial.com' });
  if (!staffExists) {
    await User.create({
      name: 'Cashier One',
      email: 'staff@nordicdial.com',
      password: 'Staff@123',
      role: 'staff',
    });
    console.log('Created staff account: staff@nordicdial.com / Staff@123');
  }

  let supplier = await Supplier.findOne({ name: 'Global Watch Distributors' });
  if (!supplier) {
    supplier = await Supplier.create({
      name: 'Global Watch Distributors',
      contactPerson: 'Rafiq Ahmed',
      phone: '+880-1700-000000',
      email: 'orders@globalwatchdist.com',
      address: 'Dhaka, Bangladesh',
    });
    console.log('Created sample supplier: Global Watch Distributors');
  }

  const sampleProducts = [
    { name: 'Classic Steel Watch', sku: 'WCH-001', category: 'Watches', price: 2500, costPrice: 1500, quantity: 25, reorderLevel: 10 },
    { name: 'Leather Strap Watch', sku: 'WCH-002', category: 'Watches', price: 3200, costPrice: 2000, quantity: 8, reorderLevel: 10 },
    { name: 'Digital Sport Watch', sku: 'WCH-003', category: 'Watches', price: 1800, costPrice: 1100, quantity: 40, reorderLevel: 15 },
    { name: 'Watch Gift Box', sku: 'ACC-001', category: 'Accessories', price: 300, costPrice: 150, quantity: 60, reorderLevel: 20 },
    { name: 'Screen Protector Kit', sku: 'ACC-002', category: 'Accessories', price: 150, costPrice: 60, quantity: 5, reorderLevel: 15 },
  ];

  for (const p of sampleProducts) {
    const exists = await Product.findOne({ sku: p.sku });
    if (!exists) {
      await Product.create({ ...p, supplier: supplier._id });
      console.log(`Created product: ${p.name} (${p.sku})`);
    }
  }

  console.log('Seeding complete.');
  mongoose.connection.close();
};

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
