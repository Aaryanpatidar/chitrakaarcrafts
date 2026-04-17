import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/products?limit=1"),
      api.get("/orders?limit=1"),
      api.get("/orders?status=Pending&limit=100"),
    ]).then(([products, orders, pending]) => {
      const totalRevenue = orders.data.orders.reduce((acc, o) => acc + o.totalPrice, 0);
      setStats({
        totalProducts: products.data.total,
        totalOrders: orders.data.total,
        pendingOrders: pending.data.total,
        revenue: totalRevenue,
        recentOrders: orders.data.orders.slice(0, 5),
      });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts || 0, icon: "🎨", color: "#c4613a", link: "/admin/products" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: "📦", color: "#d4a017", link: "/admin/orders" },
    { label: "Pending Orders", value: stats?.pendingOrders || 0, icon: "⏳", color: "#7a8c6e", link: "/admin/orders?status=Pending" },
    { label: "Total Revenue", value: `₹${(stats?.revenue || 0).toLocaleString("en-IN")}`, icon: "💰", color: "#2c1a0e", link: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="section-heading" style={{ marginBottom: "0.5rem" }}>Admin Dashboard</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Welcome back! Here's what's happening.</p>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((s) => (
          <Link to={s.link} key={s.label} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div>
              <p style={styles.statValue}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/admin/products/new" className="btn btn-primary">+ Add New Product</Link>
          <Link to="/admin/orders" className="btn btn-secondary">View All Orders</Link>
          <Link to="/products" className="btn btn-outline">Visit Store →</Link>
        </div>
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders?.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Orders</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.th}>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id} style={styles.tr}>
                  <td style={styles.td}>
                    <Link to={`/admin/orders/${order._id}`} style={{ color: "var(--terracotta)" }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td style={styles.td}>{order.user?.name || "—"}</td>
                  <td style={styles.td}>₹{order.totalPrice.toLocaleString("en-IN")}</td>
                  <td style={styles.td}>
                    <span className={`badge ${statusColor(order.status)}`}>{order.status}</span>
                  </td>
                  <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusColor(s) {
  return { Pending: "badge-warning", Processing: "badge-info", Shipped: "badge-info", Delivered: "badge-success", Cancelled: "badge-danger" }[s] || "badge-neutral";
}

const styles = {
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" },
  statCard: { background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 2px 8px rgba(44,26,14,0.06)", transition: "box-shadow 0.2s", textDecoration: "none" },
  statIcon: { fontSize: "2rem", flexShrink: 0 },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", fontWeight: 700, color: "var(--deep-brown)", lineHeight: 1 },
  statLabel: { fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" },
  section: { background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginBottom: "1.25rem", color: "var(--deep-brown)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" },
  th: { background: "var(--cream)", textAlign: "left" },
  tr: { borderBottom: "1px solid var(--border)" },
  td: { padding: "0.75rem 1rem", color: "var(--text-secondary)" },
};