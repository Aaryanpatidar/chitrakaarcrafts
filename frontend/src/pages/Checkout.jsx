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

  // ─── Razorpay Flow (UPI / Card) ──────────────────────────────
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
      image: "https://i.imgur.com/your-logo.png", // replace with your logo URL
      prefill: {
        name: user?.name || shippingAddress.fullName,
        email: user?.email || "",
        contact: shippingAddress.phone,
      },
      notes: {
        shipping_address: `${shippingAddress.address}, ${shippingAddress.city}`,
      },
      theme: {
        color: "#c4613a", // terracotta — matches your brand
      },
      // Allow UPI, cards, netbanking, wallets
      method: form.paymentMethod === "UPI"
        ? { upi: true, card: false, netbanking: false, wallet: false }
        : { upi: false, card: true, netbanking: true, wallet: true },
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
    toast.success("Payment successful! Order confirmed. 🎉");
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
        toast("Payment cancelled.", { icon: "ℹ️" });
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
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png"
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
                `📦 Place Order — ₹${total.toLocaleString("en-IN")}`
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
