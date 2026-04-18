import React from "react";
import { NavLink, Outlet } from "react-router-dom";


const NAV = [
  { to: "/admin", label: "📊 Dashboard", end: true },
  { to: "/admin/products", label: "🎨 Products" },
  { to: "/admin/orders", label: "📦 Orders" },
];

export default function AdminLayout() {
  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <p style={styles.sidebarTitle}>Admin Panel</p>
        <nav>
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navActive : {}) })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.divider} />
        <NavLink to="/" style={styles.navLink}>🏪 View Store</NavLink>
      </aside>

      {/* Content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "calc(100vh - 68px)", background: "var(--cream)" },
  sidebar: { width: 220, flexShrink: 0, background: "white", borderRight: "1px solid var(--border)", padding: "1.5rem 0.75rem", position: "sticky", top: 68, alignSelf: "flex-start", minHeight: "calc(100vh - 68px)" },
  sidebarTitle: { fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", fontWeight: 700, padding: "0 0.75rem", marginBottom: "0.75rem" },
  navLink: { display: "flex", alignItems: "center", padding: "0.6rem 0.75rem", borderRadius: 8, fontSize: "0.88rem", color: "var(--text-secondary)", fontWeight: 500, marginBottom: "0.1rem", transition: "all 0.15s", textDecoration: "none" },
  navActive: { background: "#F5EFF4", color: "var(--terracotta)" },
  divider: { height: 1, background: "var(--border)", margin: "1rem 0.75rem" },
  main: { flex: 1, padding: "2rem 2.5rem", minWidth: 0 },
};