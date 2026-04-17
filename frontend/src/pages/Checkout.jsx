import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "", address: "", city: "", state: "", pincode: "", phone: "",
    paymentMethod: "COD",
  });

  const shipping = cartTotal > 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");
    setLoading(true);
    try {
      const { paymentMethod, ...shippingAddress } = form;
      const orderItems = items.map((i) => ({
        product: i.product, name: i.name, image: i.image, price: i.price, quantity: i.quantity,
      }));
      const { data } = await api.post("/orders", { items: orderItems, shippingAddress, paymentMethod });
      clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate(`/orders/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="section-heading" style={{ marginBottom: "2rem" }}>Checkout</h1>
        <div style={styles.layout}>
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ flex: 1 }}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📍 Shipping Address</h3>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="fullName" required value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea className="form-textarea" name="address" required value={form.address} onChange={handleChange} placeholder="House/Flat No., Street, Area" rows={3} />
              </div>
              <div style={styles.twoCol}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" name="city" required value={form.city} onChange={handleChange} placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="form-input" name="state" required value={form.state} onChange={handleChange} placeholder="State" />
                </div>
              </div>
              <div style={styles.twoCol}>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input className="form-input" name="pincode" required value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" name="phone" required value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💳 Payment Method</h3>
              {["COD", "UPI", "Card"].map((method) => (
                <label key={method} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={handleChange}
                    style={{ accentColor: "var(--terracotta)" }}
                  />
                  <span>
                    {method === "COD" && "💵 Cash on Delivery"}
                    {method === "UPI" && "📱 UPI Payment"}
                    {method === "Card" && "💳 Credit / Debit Card"}
                  </span>
                </label>
              ))}
            </div>

            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
              {loading ? "Placing Order…" : `Place Order — ₹${total.toLocaleString("en-IN")}`}
            </button>
          </form>

          {/* Summary */}
          <div style={styles.summary}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            {items.map((item) => (
              <div key={item.product} style={styles.itemRow}>
                <span style={styles.itemName}>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div style={styles.divider} />
            <div style={styles.itemRow}><span>Subtotal</span><span>₹{cartTotal.toLocaleString("en-IN")}</span></div>
            <div style={styles.itemRow}><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
            <div style={styles.divider} />
            <div style={{ ...styles.itemRow, fontWeight: 700, fontSize: "1.05rem" }}>
              <span>Total</span>
              <span style={{ color: "var(--terracotta)" }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", gap: "2rem", alignItems: "flex-start" },
  section: { background: "white", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--border)", marginBottom: "1.25rem" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginBottom: "1.25rem", color: "var(--deep-brown)" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  radioLabel: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.9rem", cursor: "pointer" },
  summary: { width: 300, flexShrink: 0, background: "white", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--border)", position: "sticky", top: 88 },
  itemRow: { display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.6rem" },
  itemName: { color: "var(--text-secondary)", flex: 1, marginRight: "0.5rem" },
  divider: { height: 1, background: "var(--border)", margin: "0.75rem 0" },
};