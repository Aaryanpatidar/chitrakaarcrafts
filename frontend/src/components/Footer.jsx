import { Link } from "react-router-dom";
import React from "react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.brand}>
          <span style={styles.logo}>🎨 ChitraKaar Crafts</span>
          <p style={styles.tagline}>Handcrafted art, straight from Indian artisans to your doorstep.</p>
        </div>
        <div style={styles.links}>
          <strong style={styles.col}>Shop</strong>
          <Link to="/products" style={styles.link}>All Products</Link>
          <Link to="/products?category=Painting" style={styles.link}>Paintings</Link>
          <Link to="/products?category=Pottery" style={styles.link}>Pottery</Link>
        </div>
        <div style={styles.links}>
          <strong style={styles.col}>Account</strong>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
          <Link to="/orders" style={styles.link}>My Orders</Link>
        </div>
      </div>
      <div style={styles.bottom}>
        <p>© {new Date().getFullYear()} ChitraKaar Crafts. All rights reserved.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: "#4A2E4A", color: "#F5EFF4", marginTop: "auto" },
  inner: { maxWidth: 1280, margin: "0 auto", padding: "3rem 1.5rem 2rem", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "2rem" },
  brand: {},
  logo: { fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "white", display: "block", marginBottom: "0.75rem" },
  tagline: { fontSize: "0.88rem", color: "#F5EFF4", lineHeight: 1.6, maxWidth: 280 },
  links: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  col: { color: "#4A2E4A", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" },
  link: { fontSize: "0.88rem", color: "#F5EFF4", transition: "color 0.2s" },
  bottom: { borderTop: "1px solid #4A2E4A", textAlign: "center", padding: "1.25rem 1.5rem", fontSize: "0.8rem", color: "#F5EFF4" },
};