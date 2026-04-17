import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  Pending: "badge-warning", Processing: "badge-info", Shipped: "badge-info",
  Delivered: "badge-success", Cancelled: "badge-danger",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api.get("/orders/my")
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel order");
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 900 }}>
        <h1 className="section-heading" style={{ marginBottom: "0.5rem" }}>My Orders</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your orders will appear here once you place one.</p>
            <br />
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="card" style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <p style={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${STATUS_COLORS[order.status] || "badge-neutral"}`}>{order.status}</span>
                  <p style={styles.orderTotal}>₹{order.totalPrice.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div style={styles.items}>
                {order.items.map((item, i) => (
                  <div key={i} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemMeta}>× {item.quantity} — ₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <div style={styles.orderFooter}>
                <p style={styles.payment}>Payment: {order.paymentMethod}</p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View Details</Link>
                  {order.status === "Pending" && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(order._id)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  orderCard: { padding: "1.5rem", marginBottom: "1rem" },
  orderHeader: { display: "flex", justifyContent: "space-between", marginBottom: "1rem" },
  orderId: { fontWeight: 700, fontSize: "0.95rem", color: "var(--deep-brown)" },
  orderDate: { fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" },
  orderTotal: { fontWeight: 700, color: "var(--terracotta)", marginTop: "0.3rem" },
  items: { borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginBottom: "0.75rem" },
  itemRow: { display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.88rem" },
  itemName: { color: "var(--text-secondary)" },
  itemMeta: { color: "var(--text-muted)" },
  orderFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" },
  payment: { fontSize: "0.82rem", color: "var(--text-muted)" },
};