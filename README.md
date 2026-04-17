# 🎨 ChitraKaar Crafts

A full-stack Indian art e-commerce platform built with **Node.js + Express + MongoDB + React**.

---

## 📁 Project Structure

```
chitrakaarcrafts/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Signup, Login, Profile
│   │   ├── productController.js   # CRUD + Search/Filter
│   │   └── orderController.js     # Place, Track, Manage orders
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js                # User schema (role: user/admin)
│   │   ├── Product.js             # Product schema with reviews
│   │   └── Order.js               # Order schema with items
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── seed.js                    # Sample data seeder
│   ├── server.js                  # Express app entry point
│   ├── .env.example               # Environment variable template
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProductCard.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   ├── AuthContext.jsx    # Global auth state
│       │   └── CartContext.jsx    # Global cart state (localStorage)
│       ├── pages/
│       │   ├── Home.jsx           # Hero + Categories + Featured
│       │   ├── Products.jsx       # Browse + Search + Filter
│       │   ├── ProductDetail.jsx  # Single product view
│       │   ├── Cart.jsx           # Cart management
│       │   ├── Checkout.jsx       # Place order form
│       │   ├── Orders.jsx         # My orders list
│       │   ├── Auth.jsx           # Login + Signup
│       │   └── admin/
│       │       ├── AdminLayout.jsx
│       │       ├── Dashboard.jsx  # Stats overview
│       │       ├── Products.jsx   # Add/Edit/Delete products
│       │       └── Orders.jsx     # Manage all orders
│       ├── utils/
│       │   └── api.js             # Axios instance with JWT interceptor
│       ├── App.jsx                # All routes
│       ├── main.jsx               # React entry point
│       └── index.css              # Global styles (CSS variables)
│
├── package.json                   # Root — runs both servers with concurrently
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 2. Clone & Install

```bash
git clone <repo-url>
cd chitrakaarcrafts
npm run install-all
```

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chitrakaarcrafts
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

### 4. Seed Sample Data

```bash
cd backend
node seed.js
```

This creates:
| Role  | Email                           | Password   |
|-------|---------------------------------|------------|
| Admin | admin@chitrakaarcrafts.com      | admin123   |
| User  | user@chitrakaarcrafts.com       | user1234   |

And inserts **12 sample products** across categories.

### 5. Run the App

```bash
# From root — runs both backend (port 5000) and frontend (port 5173)
npm run dev
```

Open → **http://localhost:5173**

---

## 🔌 API Reference

### Auth
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /api/auth/signup      | Public  | Register new user    |
| POST   | /api/auth/login       | Public  | Login + get token    |
| GET    | /api/auth/profile     | Private | Get user profile     |
| PUT    | /api/auth/profile     | Private | Update profile       |

### Products
| Method | Endpoint              | Access  | Description                     |
|--------|-----------------------|---------|---------------------------------|
| GET    | /api/products         | Public  | Get all (search, filter, page)  |
| GET    | /api/products/featured| Public  | Get featured products           |
| GET    | /api/products/:id     | Public  | Get single product              |
| POST   | /api/products         | Admin   | Create product                  |
| PUT    | /api/products/:id     | Admin   | Update product                  |
| DELETE | /api/products/:id     | Admin   | Delete product                  |

**Query params for GET /api/products:**
- `keyword` — search name/description/artist
- `category` — filter by category
- `minPrice` / `maxPrice` — price range
- `page` / `limit` — pagination

### Orders
| Method | Endpoint               | Access  | Description           |
|--------|------------------------|---------|-----------------------|
| POST   | /api/orders            | Private | Place new order       |
| GET    | /api/orders/my         | Private | Get my orders         |
| GET    | /api/orders/:id        | Private | Get order by ID       |
| GET    | /api/orders            | Admin   | Get all orders        |
| PUT    | /api/orders/:id/status | Admin   | Update order status   |
| PUT    | /api/orders/:id/cancel | Private | Cancel pending order  |

---

## ✨ Features Implemented

### 👤 User
- [x] Signup / Login with JWT auth
- [x] Browse all art products
- [x] Search by keyword (name, description, artist)
- [x] Filter by category & price range
- [x] Pagination
- [x] Product detail page with quantity selector
- [x] Cart with localStorage persistence
- [x] Free shipping over ₹999
- [x] Checkout with address + payment method
- [x] Order history with live status tracker
- [x] Cancel pending orders

### 🛠 Admin
- [x] Admin dashboard with revenue stats
- [x] Add / Edit / Delete products
- [x] Mark products as Featured
- [x] Manage all orders with status tabs
- [x] Update order status (Pending → Processing → Shipped → Delivered)

---

## 🛠 Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Backend   | Node.js, Express.js           |
| Database  | MongoDB + Mongoose            |
| Auth      | JWT + bcryptjs                |
| Frontend  | React 18 + Vite               |
| Routing   | React Router v6               |
| HTTP      | Axios (with JWT interceptor)  |
| Toasts    | react-hot-toast               |
| Fonts     | Playfair Display + DM Sans    |

---

## 🔐 Environment Variables

| Variable    | Description                            |
|-------------|----------------------------------------|
| PORT        | Backend port (default: 5000)           |
| MONGO_URI   | MongoDB connection string              |
| JWT_SECRET  | Secret key for JWT signing             |
| NODE_ENV    | development or production              |

---

## 📦 Product Categories

`Painting` · `Sculpture` · `Pottery` · `Jewelry` · `Textile` · `Digital Art` · `Other`

---

## 🔮 Possible Enhancements

- [ ] Image upload (Cloudinary / AWS S3)
- [ ] Payment gateway (Razorpay / Stripe)
- [ ] Product reviews & ratings
- [ ] Wishlist
- [ ] Email notifications (Nodemailer)
- [ ] OTP / Google OAuth login
- [ ] Coupon / discount codes
- [ ] Export orders as PDF/CSV (admin)