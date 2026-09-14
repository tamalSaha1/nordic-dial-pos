# Nordic Dial — Inventory & Billing POS System

A full-stack Point-of-Sale system built with **Node.js + Express + MongoDB** (backend/API) and **plain HTML/CSS/JavaScript** (frontend). Built as an academic Web Lab project.

## Features

- **Dual login**: one login form, two roles (`manager` and `staff`) — role comes from the database, not from anything the user picks, so it can't be spoofed from the browser.
- Manager: full access — manage staff accounts, suppliers, products, approve/reject returns, view revenue & reports.
- Staff (cashier): generate invoices (POS), view stock, view sales history, file return requests (require manager approval).
- Stock tracking with SKU/barcode-style lookup, categories, and low-stock flags.
- Invoice generation that auto-totals and **automatically decrements stock**.
- **Auto-Reorder (wow factor)**: whenever a sale drops a product's stock to or below its reorder level, the system automatically creates a reorder request and simulates notifying the supplier (logged to the server console + visible in the Dashboard/Reports).
- Returns/refunds that adjust stock and invoice status.
- Sales history search by date, customer, and status.
- Best-selling items report and a daily/weekly/monthly revenue dashboard.
- Printable/exportable invoice view.
- Supplier management with per-supplier product list and reorder history.

## Tech Stack

- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT auth, bcrypt password hashing
- **Frontend**: Plain HTML/CSS/JavaScript (no framework) — served as static files by Express
- **Database**: MongoDB (local or MongoDB Atlas)

## Project Structure

```
kinetic-ledger-pos/
├── config/db.js              MongoDB connection
├── models/                   Mongoose schemas (User, Product, Supplier, Invoice, Return, ReorderRequest)
├── middleware/                auth.js (JWT check), role.js (manager-only guards)
├── controllers/                business logic per feature
├── routes/                     API endpoints, wired with role-based access
├── utils/                       generateToken.js, autoReorder.js
├── public/                    the actual website (HTML/CSS/JS)
├── server.js                   Express app entry point
├── seed.js                     creates a demo manager + staff account and sample stock
└── .env.example                copy this to .env and fill in your own values
```

## Setup Instructions

### 1. Install prerequisites
- [Node.js](https://nodejs.org) v18 or later
- MongoDB — either:
  - **Local**: install MongoDB Community Server and run it (`mongod`), or
  - **Cloud (recommended for easy grading/demo)**: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), then get your connection string.

### 2. Install dependencies
```bash
cd kinetic-ledger-pos
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Then edit `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/kinetic_ledger      # or your Atlas connection string
JWT_SECRET=any_long_random_string_you_want
PORT=5000
```

### 4. Seed the database (creates demo accounts + sample products)
```bash
npm run seed
```
This creates:
- **Manager login**: `manager@nordicdial.com` / `Manager@123`
- **Staff login**: `staff@nordicdial.com` / `Staff@123`
- One sample supplier and five sample products (some intentionally low-stock, to demo the auto-reorder feature).

### 5. Run the server
```bash
npm start
```
Or for auto-restart during development:
```bash
npm run dev
```

### 6. Open the app
Visit **http://localhost:5000** in your browser. You'll land on the login page.

Try both accounts to see the difference:
- Log in as **manager** → you'll see Suppliers, Reports & Revenue, and Staff Accounts in the sidebar in addition to the shared pages.
- Log in as **staff** → those three are hidden; staff can still create invoices, check stock, view sales history, and file returns (which then need manager approval).

### 7. See the Auto-Reorder feature in action
The seeded data includes a couple of low-stock items (`Leather Strap Watch`, `Screen Protector Kit`). Go to **New Invoice**, sell a few units of one of these until stock hits the reorder level — a reorder request will automatically appear on the **Dashboard** and in the server terminal log.

## API Overview (for reference / your project report)

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |
| GET/POST/PUT/DELETE | `/api/users` | Manager only |
| GET | `/api/products` | Manager + Staff |
| POST/PUT/DELETE | `/api/products` | Manager only |
| GET | `/api/products/lookup/:sku` | Manager + Staff |
| GET/POST/PUT/DELETE | `/api/suppliers` | GET: both, write: Manager only |
| POST/GET | `/api/invoices` | Manager + Staff |
| POST/GET | `/api/returns` | Manager + Staff |
| PUT | `/api/returns/:id/approve` `/reject` | Manager only |
| GET | `/api/reorders` | Manager + Staff |
| PUT | `/api/reorders/:id/fulfill` | Manager only |
| GET | `/api/reports/stock-summary`, `/best-sellers` | Manager + Staff |
| GET | `/api/reports/revenue` | Manager only |

## Notes for Deployment

- To deploy (e.g. on Render, Railway, or a VPS), set the same environment variables from `.env` in your host's dashboard and point `MONGO_URI` at an Atlas cluster (so the database persists between deploys).
- Change `JWT_SECRET` to a strong random value before submitting/demoing publicly.
- The demo passwords in `seed.js` should be changed if this is ever used with real data.
