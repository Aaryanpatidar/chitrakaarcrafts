import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { loadRazorpayScript, openRazorpayCheckout } from "../utils/razorpay";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "", address: "", city: "", state: "", pincode: "", phone: "",
    paymentMethod: "COD",
  });

  const shipping = cartTotal > 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ─── COD Flow ───────────────────────────────────────────────
  const handleCOD = async (shippingAddress, orderItems) => {
    const { data } = await api.post("/orders", {
      items: orderItems,
      shippingAddress,
      paymentMethod: "COD",
    });
    clearCart();
    toast.success("Order placed! We'll collect payment on delivery. 🎉");
    navigate(`/orders/${data._id}`);
  };

  // ─── Razorpay Flow ──────────────────────────────
  const handleRazorpayPayment = async (shippingAddress, orderItems) => {
    // 1. Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Failed to load Razorpay. Please check your internet connection.");
    }

    // 2. Create Razorpay order on backend
    const { data: rzpOrder } = await api.post("/payment/create-order", { amount: total });

   
  // 3. Open Razorpay modal
    const paymentResponse = await openRazorpayCheckout({
      key: rzpOrder.keyId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      order_id: rzpOrder.razorpayOrderId,
      name: "ChitraKaar Crafts",
      description: `Payment for ${orderItems.length} item(s)`,
      image: "https://res.cloudinary.com/dkpy45wnx/image/upload/q_auto/f_auto/v1776450667/CCImage_kfttsv.jpg",
      prefill: {
        name: user?.name || shippingAddress.fullName,
        email: user?.email || "",
        contact: shippingAddress.phone,
      },
      notes: {
        shipping_address: `${shippingAddress.address}, ${shippingAddress.city}`,
      },
      theme: {
        color: "#F5EFF4", 
      }
    });

    // 4. Verify payment on backend + create order
    const { data: order } = await api.post("/payment/verify", {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      items: orderItems,
      shippingAddress,
      paymentMethod: form.paymentMethod,
    });

    clearCart();
    toast.success("Payment successful! Order confirmed...");
    navigate(`/orders/${order._id}`);
  };

  // ─── Main Submit Handler ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");

    // Validate pincode & phone
    if (!/^\d{6}$/.test(form.pincode)) return toast.error("Enter a valid 6-digit pincode");
    if (!/^\d{10}$/.test(form.phone)) return toast.error("Enter a valid 10-digit phone number");

    setLoading(true);

    const { paymentMethod, ...shippingAddress } = form;
    const orderItems = items.map((i) => ({
      product: i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
    }));

    try {
      if (paymentMethod === "COD") {
        await handleCOD(shippingAddress, orderItems);
      } else {
        await handleRazorpayPayment(shippingAddress, orderItems);
      }
    } catch (err) {
      // Don't show error if user simply dismissed the modal
      if (err.message !== "Payment cancelled by user") {
        toast.error(err.response?.data?.message || err.message || "Something went wrong");
      } else {
        toast("Payment cancelled...!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="section-heading" style={{ marginBottom: "2rem" }}>Checkout</h1>
        <div style={styles.layout}>

          {/* ── Left: Form ── */}
          <form onSubmit={handleSubmit} style={{ flex: 1 }}>

            {/* Shipping */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📍 Shipping Address</h3>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="fullName" required value={form.fullName}
                  onChange={handleChange} placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea className="form-textarea" name="address" required value={form.address}
                  onChange={handleChange} placeholder="House/Flat No., Street, Area" rows={3} />
              </div>
              <div style={styles.twoCol}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" name="city" required value={form.city}
                    onChange={handleChange} placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="form-input" name="state" required value={form.state}
                    onChange={handleChange} placeholder="State" />
                </div>
              </div>
              <div style={styles.twoCol}>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input className="form-input" name="pincode" required value={form.pincode}
                    onChange={handleChange} placeholder="6-digit pincode" maxLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" name="phone" required value={form.phone}
                    onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💳 Payment Method</h3>

              {/* COD */}
              <label style={styles.radioCard}>
                <input type="radio" name="paymentMethod" value="COD"
                  checked={form.paymentMethod === "COD"} onChange={handleChange}
                  style={{ accentColor: "var(--terracotta)" }} />
                <div style={styles.radioContent}>
                  <span style={styles.radioIcon}>💵</span>
                  <div>
                    <p style={styles.radioTitle}>Cash on Delivery</p>
                    <p style={styles.radioDesc}>Pay when your order arrives</p>
                  </div>
                </div>
              </label>

              {/* UPI */}
              <label style={styles.radioCard}>
                <input type="radio" name="paymentMethod" value="UPI"
                  checked={form.paymentMethod === "UPI"} onChange={handleChange}
                  style={{ accentColor: "var(--terracotta)" }} />
                <div style={styles.radioContent}>
                  <span style={styles.radioIcon}>📱</span>
                  <div>
                    <p style={styles.radioTitle}>UPI Payment</p>
                    <p style={styles.radioDesc}>Pay via GPay, PhonePe, Paytm, or any UPI app</p>
                  </div>
                  <img src="data:image/jpeg;base64,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"
                    alt="UPI" style={styles.payLogo} />
                </div>
              </label>

              {/* Card */}
              <label style={styles.radioCard}>
                <input type="radio" name="paymentMethod" value="Card"
                  checked={form.paymentMethod === "Card"} onChange={handleChange}
                  style={{ accentColor: "var(--terracotta)" }} />
                <div style={styles.radioContent}>
                  <span style={styles.radioIcon}>💳</span>
                  <div>
                    <p style={styles.radioTitle}>Credit / Debit Card</p>
                    <p style={styles.radioDesc}>Visa, Mastercard, RuPay, Amex accepted</p>
                  </div>
                  <div style={styles.cardLogos}>
                    <span style={styles.cardTag}>VISA</span>
                    <span style={styles.cardTag}>MC</span>
                    <span style={styles.cardTag}>RuPay</span>
                  </div>
                </div>
              </label>

              {/* Razorpay secure badge */}
              {form.paymentMethod !== "COD" && (
                <div style={styles.secureBadge}>
                  🔒 Payments are secured by <strong>Razorpay</strong> — 256-bit SSL encryption
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              className="btn btn-primary btn-lg btn-full"
              type="submit"
              disabled={loading}
              style={{ fontSize: "1rem" }}
            >
              {loading ? (
                <span>Processing…</span>
              ) : form.paymentMethod === "COD" ? (
                `Place Order — ₹${total.toLocaleString("en-IN")}`
              ) : (
                `🔒 Pay ₹${total.toLocaleString("en-IN")} via ${form.paymentMethod}`
              )}
            </button>

            <p style={styles.footerNote}>
              By placing this order, you agree to our Terms & Conditions.
            </p>
          </form>

          {/* ── Right: Summary ── */}
          <div style={styles.summary}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            <div style={styles.itemsList}>
              {items.map((item) => (
                <div key={item.product} style={styles.itemRow}>
                  <span style={styles.itemName}>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 500 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div style={styles.divider} />
            <div style={styles.itemRow}>
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={styles.itemRow}>
              <span>Shipping</span>
              <span>
                {shipping === 0
                  ? <span style={{ color: "#15803d", fontWeight: 600 }}>FREE</span>
                  : `₹${shipping}`}
              </span>
            </div>
            {shipping > 0 && (
              <p style={styles.freeShip}>
                Add ₹{(1000 - cartTotal).toFixed(0)} more for free shipping
              </p>
            )}
            <div style={styles.divider} />
            <div style={{ ...styles.itemRow, fontWeight: 700, fontSize: "1.1rem" }}>
              <span>Total</span>
              <span style={{ color: "var(--terracotta)" }}>
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Payment method reminder */}
            <div style={styles.methodReminder}>
              {form.paymentMethod === "COD" && <span>💵 Cash on Delivery</span>}
              {form.paymentMethod === "UPI" && <span>📱 UPI via Razorpay</span>}
              {form.paymentMethod === "Card" && <span>💳 Card via Razorpay</span>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" },
  section: {
    background: "white", borderRadius: 12, padding: "1.5rem",
    border: "1px solid var(--border)", marginBottom: "1.25rem",
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: "1.1rem",
    marginBottom: "1.25rem", color: "var(--deep-brown)",
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },

  // Payment radio cards
  radioCard: {
    display: "flex", alignItems: "flex-start", gap: "0.75rem",
    padding: "1rem", border: "1.5px solid var(--border)", borderRadius: 10,
    marginBottom: "0.75rem", cursor: "pointer", transition: "border-color 0.2s",
  },
  radioContent: { display: "flex", flex: 1, alignItems: "center", gap: "0.75rem" },
  radioIcon: { fontSize: "1.4rem", flexShrink: 0 },
  radioTitle: { fontWeight: 600, fontSize: "0.92rem", color: "var(--deep-brown)", marginBottom: "0.15rem" },
  radioDesc: { fontSize: "0.78rem", color: "var(--text-muted)" },
  payLogo: { height: 22, marginLeft: "auto", objectFit: "contain" },
  cardLogos: { display: "flex", gap: "0.3rem", marginLeft: "auto" },
  cardTag: {
    background: "var(--sand)", color: "var(--medium-brown)", fontSize: "0.65rem",
    fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: 4, letterSpacing: "0.03em",
  },
  secureBadge: {
    background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
    padding: "0.65rem 1rem", fontSize: "0.8rem", color: "#15803d", marginTop: "0.5rem",
  },
  footerNote: {
    textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.75rem",
  },

  // Summary
  summary: {
    width: 300, flexShrink: 0, background: "white", borderRadius: 12, padding: "1.5rem",
    border: "1px solid var(--border)", position: "sticky", top: 88,
  },
  itemsList: { marginBottom: "0.5rem" },
  itemRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: "0.88rem", marginBottom: "0.55rem", color: "var(--text-secondary)",
  },
  itemName: { flex: 1, marginRight: "0.5rem", color: "var(--text-secondary)" },
  divider: { height: 1, background: "var(--border)", margin: "0.75rem 0" },
  freeShip: { fontSize: "0.76rem", color: "var(--terracotta)", marginTop: "-0.25rem", marginBottom: "0.5rem" },
  methodReminder: {
    marginTop: "1rem", padding: "0.6rem 0.85rem", background: "var(--cream)",
    borderRadius: 8, fontSize: "0.82rem", color: "var(--text-secondary)", textAlign: "center",
  },
};
