import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropOpen(false);
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🎨</span>
          <span>
            <span style={styles.logoMain}>ChitraKaar</span>
            <span style={styles.logoCrafts}> Crafts</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={styles.nav}>
          <NavLink to="/products" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>
            Shop
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right actions */}
        <div style={styles.actions}>
          {/* Cart */}
          <Link to="/cart" style={styles.cartBtn}>
            <span>🛒</span>
            {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
          </Link>

          {/* User */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                style={styles.userBtn}
                onClick={() => setDropOpen((p) => !p)}
              >
                <span style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</span>
                <span style={styles.userName}>{user.name.split(" ")[0]}</span>
                <span>▾</span>
              </button>
              {dropOpen && (
                <div style={styles.dropdown}>
                  <Link to="/orders" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                    📦 My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <hr style={{ border: "none", borderTop: "1px solid #e0cdb8", margin: "0.25rem 0" }} />
                  <button style={{ ...styles.dropItem, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#dc2626" }} onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/signup" style={styles.signupBtn}>Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button style={styles.hamburger} onClick={() => setMenuOpen((p) => !p)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/products" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/cart" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
          {user ? (
            <>
              <Link to="/orders" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Orders</Link>
              {isAdmin && <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button style={{ ...styles.mobileLink, background: "none", border: "none", color: "#dc2626", textAlign: "left" }} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

const styles = {
  header: { background: "white", borderBottom: "1px solid #e0cdb8", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(44,26,14,0.06)" },
  inner: { maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", height: 68, display: "flex", alignItems: "center", gap: "1.5rem" },
  logo: { display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 },
  logoIcon: { fontSize: "1.5rem" },
  logoMain: { fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#2c1a0e" },
  logoCrafts: { fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", color: "#c4613a" },
  nav: { display: "flex", gap: "0.25rem", flex: 1 },
  navLink: { padding: "0.4rem 0.85rem", borderRadius: 6, fontSize: "0.9rem", color: "#5c3d2e", fontWeight: 500, transition: "all 0.2s" },
  navLinkActive: { background: "#fdf0ea", color: "#c4613a" },
  actions: { display: "flex", alignItems: "center", gap: "0.75rem" },
  cartBtn: { position: "relative", fontSize: "1.3rem", padding: "0.3rem", display: "flex", alignItems: "center" },
  cartBadge: { position: "absolute", top: -4, right: -4, background: "#c4613a", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  userBtn: { display: "flex", alignItems: "center", gap: "0.5rem", background: "#faf6f0", border: "1px solid #e0cdb8", borderRadius: 8, padding: "0.4rem 0.85rem", cursor: "pointer", fontSize: "0.88rem", color: "#2c1a0e" },
  avatar: { width: 28, height: 28, background: "#c4613a", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" },
  userName: { fontWeight: 500 },
  dropdown: { position: "absolute", top: "110%", right: 0, background: "white", border: "1px solid #e0cdb8", borderRadius: 10, boxShadow: "0 8px 24px rgba(44,26,14,0.12)", minWidth: 180, zIndex: 200, padding: "0.4rem 0" },
  dropItem: { display: "block", padding: "0.6rem 1.1rem", fontSize: "0.88rem", color: "#2c1a0e", transition: "background 0.15s" },
  authBtns: { display: "flex", gap: "0.5rem" },
  loginBtn: { padding: "0.45rem 1rem", fontSize: "0.88rem", color: "#c4613a", border: "1.5px solid #c4613a", borderRadius: 7, fontWeight: 500 },
  signupBtn: { padding: "0.45rem 1rem", fontSize: "0.88rem", background: "#c4613a", color: "white", borderRadius: 7, fontWeight: 500 },
  hamburger: { display: "none", background: "none", fontSize: "1.3rem", color: "#2c1a0e" },
  mobileMenu: { background: "white", borderTop: "1px solid #e0cdb8", padding: "0.75rem 1.5rem", display: "flex", flexDirection: "column" },
  mobileLink: { padding: "0.75rem 0", fontSize: "0.95rem", color: "#2c1a0e", borderBottom: "1px solid #f0e8de", fontWeight: 500, display: "block" },
};