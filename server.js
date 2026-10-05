require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve the plain HTML/CSS/JS frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/reorders', require('./routes/reorderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Fallback: any non-API GET request serves the login page (simple SPA-ish routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // multer throws for bad file type / oversized file - surface these as 400s, not 500s
  if (err.name === 'MulterError' || /image/i.test(err.message || '')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: 'Something went wrong on the server', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Nordic Dial server running on http://localhost:${PORT}`));
