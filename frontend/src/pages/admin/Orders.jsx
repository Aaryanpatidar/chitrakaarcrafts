import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

const STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const STATUS_COLORS = { Pending: "badge-warning", Processing: "badge-info", Shipped: "badge-info", Delivered: "badge-success", Cancelled: "badge-danger" };

// ─── Orders List ────────────────────────────────────────
export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "All";
  const page = Number(searchParams.get("page") || 1);
  const [pages, setPages] = useState(1);

  useEffect(() => { fetchOrders(); }, [status, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (status && status !== "All") params.set("status", status);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value && value !== "All") p.set(key, value); else p.delete(key);
    p.set("page", "1");
    setSearchParams(p);
  };

  return (
    <div>
      <h1 className="section-heading" style={{ marginBottom: "0.5rem" }}>Orders</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{total} total orders</p>

      {/* Status Tabs */}
      <div style={styles.tabs}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter("status", s)}
            style={{ ...styles.tab, ...(status === s || (s === "All" && !status) ? styles.tabActive : {}) }}
          >{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders found</h3>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={styles.tr}>
                  <td style={styles.td}>
                    <Link to={`/admin/orders/${order._id}`} style={{ color: "var(--terracotta)", fontWeight: 600 }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500 }}>{order.user?.name || "—"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.user?.email}</div>
                  </td>
                  <td style={styles.td}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: "var(--terracotta)" }}>₹{order.totalPrice.toLocaleString("en-IN")}</td>
                  <td style={styles.td}>{order.paymentMethod}</td>
                  <td style={styles.td}><span className={`badge ${STATUS_COLORS[order.status] || "badge-neutral"}`}>{order.status}</span></td>
                  <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                  <td style={styles.td}>
                    <Link to={`/admin/orders/${order._id}`} className="btn btn-outline btn-sm">Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem" }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((pg) => (
            <button key={pg} className="btn btn-sm" onClick={() => setFilter("page", pg)}
              style={{ background: pg === page ? "var(--terracotta)" : "white", color: pg === page ? "white" : "var(--text-primary)", border: "1.5px solid var(--border)" }}>
              {pg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Order Detail ────────────────────────────────────────
export function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => { setOrder(data); setNewStatus(data.status); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status: newStatus });
      setOrder(data);
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 className="section-heading">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <Link to="/admin/orders" className="btn btn-outline">← All Orders</Link>
      </div>

      <div style={styles.grid}>
        {/* Left */}
        <div>
          {/* Items */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Order Items</h3>
            {order.items.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>× {item.quantity} — ₹{item.price.toLocaleString("en-IN")} each</div>
                </div>
                <div style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
              </div>
            ))}
            <div style={styles.divider} />
            <div style={styles.summaryRow}><span>Items Total</span><span>₹{order.itemsPrice.toLocaleString("en-IN")}</span></div>
            <div style={styles.summaryRow}><span>Shipping</span><span>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span></div>
            <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: "1rem" }}>
              <span>Grand Total</span><span style={{ color: "var(--terracotta)" }}>₹{order.totalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Status */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Update Status</h3>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ flex: 1 }}>
                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={saving || newStatus === order.status}>
                {saving ? "Saving…" : "Update"}
              </button>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              Current: <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
            </div>
          </div>

          {/* Customer */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Customer</h3>
            <p style={styles.info}><strong>Name:</strong> {order.user?.name}</p>
            <p style={styles.info}><strong>Email:</strong> {order.user?.email}</p>
            <p style={styles.info}><strong>Payment:</strong> {order.paymentMethod}</p>
            <p style={styles.info}><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleString("en-IN")}</p>
          </div>

          {/* Shipping */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Shipping Address</h3>
            <p style={styles.info}>{order.shippingAddress.fullName}</p>
            <p style={styles.info}>{order.shippingAddress.address}</p>
            <p style={styles.info}>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
            <p style={styles.info}>📞 {order.shippingAddress.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  tabs: { display: "flex", gap: "0.25rem", marginBottom: "1.5rem", background: "white", borderRadius: 10, padding: "0.35rem", border: "1px solid var(--border)", width: "fit-content" },
  tab: { padding: "0.4rem 0.9rem", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 },
  tabActive: { background: "var(--terracotta)", color: "white" },
  tableWrap: { background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", minWidth: 700 },
  thead: { background: "var(--cream)" },
  th: { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid var(--border)" },
  td: { padding: "0.75rem 1rem", color: "var(--text-secondary)", verticalAlign: "middle" },
  grid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", alignItems: "start" },
  card: { background: "white", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--border)", marginBottom: "1rem" },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1rem", marginBottom: "1rem", color: "var(--deep-brown)" },
  itemRow: { display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border)" },
  divider: { height: 1, background: "var(--border)", margin: "0.75rem 0" },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.4rem" },
  info: { fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "0.4rem" },
};