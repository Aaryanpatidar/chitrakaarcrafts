import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import { Login, Signup } from "./pages/Auth";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import { AdminProducts, ProductForm } from "./pages/admin/Products";
import { AdminOrders, AdminOrderDetail } from "./pages/admin/Orders";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.9rem",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(44,26,14,0.15)",
          },
          success: {
            iconTheme: { primary: "#c4613a", secondary: "#fff" },
          },
        }}
      />

      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected (logged-in users) */}
        <Route
          path="/checkout"
          element={<ProtectedRoute><Checkout /></ProtectedRoute>}
        />
        <Route
          path="/orders"
          element={<ProtectedRoute><Orders /></ProtectedRoute>}
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <div className="page-wrapper">
                <div className="container" style={{ maxWidth: 700 }}>
                  <OrderDetailPage />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={<AdminRoute><AdminLayout /></AdminRoute>}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}

// ─── Inline Order Detail (user view) ─────────────────────
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "./utils/api";

function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!order) return <p>Order not found.</p>;

  const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];
  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div>
      <Link to="/orders" style={{ color: "var(--terracotta)", fontSize: "0.9rem", display: "inline-block", marginBottom: "1.5rem" }}>
        ← Back to My Orders
      </Link>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", marginBottom: "0.4rem" }}>
        Order #{order._id.slice(-8).toUpperCase()}
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      {/* Progress Tracker */}
      {order.status !== "Cancelled" && (
        <div style={detailStyles.tracker}>
          {STATUS_STEPS.map((step, i) => (
            <div key={step} style={detailStyles.trackStep}>
              <div style={{
                ...detailStyles.dot,
                ...(i <= stepIndex ? detailStyles.dotActive : {}),
              }}>
                {i < stepIndex ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "0.78rem", color: i <= stepIndex ? "var(--terracotta)" : "var(--text-muted)", fontWeight: i === stepIndex ? 700 : 400 }}>
                {step}
              </span>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{ ...detailStyles.line, background: i < stepIndex ? "var(--terracotta)" : "var(--border)" }} />
              )}
            </div>
          ))}
        </div>
      )}

      {order.status === "Cancelled" && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>❌ This order has been cancelled.</div>
      )}

      {/* Items */}
      <div style={detailStyles.card}>
        <h3 style={detailStyles.cardTitle}>Items Ordered</h3>
        {order.items.map((item, i) => (
          <div key={i} style={detailStyles.itemRow}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
              </p>
            </div>
            <p style={{ fontWeight: 700, color: "var(--terracotta)" }}>
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
        <div style={detailStyles.divider} />
        <div style={detailStyles.summaryRow}><span>Items Subtotal</span><span>₹{order.itemsPrice.toLocaleString("en-IN")}</span></div>
        <div style={detailStyles.summaryRow}><span>Shipping</span><span>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span></div>
        <div style={{ ...detailStyles.summaryRow, fontWeight: 700, fontSize: "1rem" }}>
          <span>Total Paid</span>
          <span style={{ color: "var(--terracotta)" }}>₹{order.totalPrice.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div style={detailStyles.card}>
        <h3 style={detailStyles.cardTitle}>Shipping Address</h3>
        <p>{order.shippingAddress.fullName}</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{order.shippingAddress.address}</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
          📞 {order.shippingAddress.phone}
        </p>
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
          <strong>Payment:</strong> {order.paymentMethod}
        </p>
      </div>
    </div>
  );
}

const detailStyles = {
  tracker: { display: "flex", alignItems: "flex-start", marginBottom: "2rem", position: "relative" },
  trackStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", flex: 1, position: "relative" },
  dot: { width: 32, height: 32, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", zIndex: 1 },
  dotActive: { background: "var(--terracotta)", color: "white" },
  line: { position: "absolute", top: 16, left: "50%", width: "100%", height: 2, zIndex: 0 },
  card: { background: "white", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--border)", marginBottom: "1rem" },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", marginBottom: "1rem" },
  itemRow: { display: "flex", justifyContent: "space-between", padding: "0.65rem 0", borderBottom: "1px solid var(--border)" },
  divider: { height: 1, background: "var(--border)", margin: "0.75rem 0" },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.4rem", color: "var(--text-secondary)" },
};

// ─── 404 Page ─────────────────────────────────────────────
function NotFound() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🎨</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", marginBottom: "0.5rem" }}>404</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Oops! This canvas is blank — the page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-lg">Go Back Home</Link>
    </div>
  );
}