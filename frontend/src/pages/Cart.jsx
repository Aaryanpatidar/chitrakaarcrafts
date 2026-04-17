import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const PLACEHOLDER = "https://placehold.co/80x80/e8d5b7/5c3d2e?text=Art";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal > 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Discover beautiful handcrafted art and add them to your cart.</p>
            <br />
            <Link to="/products" className="btn btn-primary btn-lg">Browse Collection</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="section-heading" style={{ marginBottom: "0.5rem" }}>Your Cart</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{items.length} item{items.length > 1 ? "s" : ""}</p>

        <div style={styles.layout}>
          {/* Items */}
          <div style={{ flex: 1 }}>
            {items.map((item) => (
              <div key={item.product} style={styles.item} className="card" >
                <img
                  src={item.image || PLACEHOLDER}
                  alt={item.name}
                  style={styles.itemImg}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div style={styles.itemInfo}>
                  <Link to={`/products/${item.product}`} style={styles.itemName}>{item.name}</Link>
                  <p style={styles.itemPrice}>₹{item.price.toLocaleString("en-IN")}</p>
                </div>
                <div style={styles.qtyRow}>
                  <button className="btn btn-outline btn-sm" onClick={() => updateQuantity(item.product, item.quantity - 1)}>−</button>
                  <span style={styles.qtyNum}>{item.quantity}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >+</button>
                </div>
                <p style={styles.itemTotal}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                <button
                  className="btn btn-sm"
                  style={{ color: "#dc2626", background: "none", border: "none" }}
                  onClick={() => removeFromCart(item.product)}
                >✕</button>
              </div>
            ))}

            <button className="btn btn-outline btn-sm" onClick={clearCart} style={{ marginTop: "0.75rem" }}>
              🗑️ Clear Cart
            </button>
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shipping === 0 ? <span style={{ color: "#15803d" }}>FREE</span> : `₹${shipping}`}</span>
            </div>
            {shipping > 0 && (
              <p style={styles.freeMsg}>Add ₹{(1000 - cartTotal).toFixed(0)} more for free shipping</p>
            )}
            <div style={styles.divider} />
            <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: "1.1rem" }}>
              <span>Total</span>
              <span style={{ color: "var(--terracotta)" }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: "1.25rem" }} onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
            <Link to="/products" style={styles.continueLink}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", gap: "2rem", alignItems: "flex-start" },
  item: { display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", marginBottom: "0.75rem" },
  itemImg: { width: 72, height: 72, objectFit: "cover", borderRadius: 8, flexShrink: 0, background: "var(--sand)" },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontWeight: 600, color: "var(--deep-brown)", fontSize: "0.95rem", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  itemPrice: { color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" },
  qtyRow: { display: "flex", alignItems: "center", gap: "0.5rem" },
  qtyNum: { width: 28, textAlign: "center", fontWeight: 600 },
  itemTotal: { fontWeight: 600, color: "var(--deep-brown)", minWidth: 80, textAlign: "right" },
  summary: { width: 300, flexShrink: 0, background: "white", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--border)", position: "sticky", top: 88 },
  summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", marginBottom: "1.25rem" },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "0.92rem", marginBottom: "0.6rem" },
  freeMsg: { fontSize: "0.78rem", color: "var(--terracotta)", marginBottom: "0.5rem" },
  divider: { height: 1, background: "var(--border)", margin: "0.75rem 0" },
  continueLink: { display: "block", textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" },
};