import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["Painting", "Sculpture", "Pottery", "Jewelry", "Textile", "Digital Art"];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products/featured")
      .then(({ data }) => {
        console.log("API:", data); // debug
        setFeatured(Array.isArray(data?.products) ? data.products : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={heroStyles.section}>
        <div style={heroStyles.overlay} />
        <div style={heroStyles.content}>
          <p style={heroStyles.eyebrow}>✦ Handcrafted with love</p>
          <h1 style={heroStyles.title}>
            Discover the Soul<br />
            <em>of Indian Craft</em>
          </h1>
          <p style={heroStyles.sub}>
            Authentic paintings, pottery, sculptures & more — straight from the artist's studio to your home.
          </p>
          <div style={heroStyles.btns}>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ background: "#4A2E4A", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px" }}>Explore Collection</Link>
            <Link to="/products?category=Painting" className="btn btn-lg" style={{
              background: "rgba(255, 255, 255, 0.25)",
              color: "#4A2E4A",
              border: "2px solid #FFFFFF",
              borderRadius: "8px",
              padding: "12px 24px",
              backdropFilter: "blur(6px)"
            }}
          >
            View Paintings
          </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: "4rem 0 2rem" }}>
        <div className="container">
          <h2 className="section-heading" style={{color: "black"}}>Browse by Category</h2>
          <div className="section-divider" />
          <div style={catStyles.grid}>
            {CATEGORIES.map((cat) => (
              <Link to={`/products?category=${cat}`} key={cat} style={catStyles.card}>
                <span style={catStyles.icon}>{catIcon(cat)}</span>
                <span style={catStyles.label}>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section style={{ padding: "3rem 0 5rem" }}>
        <div className="container">
          <h2 className="section-heading" style={{color: "black"}}>Featured Artworks</h2>
          <p className="section-sub">Handpicked pieces from our finest artisans</p>
          <div className="section-divider"/>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🖼️</div>
              <h3>No featured products yet</h3>
              <p>Check back soon or browse all products.</p>
              <br />
              <Link to="/products" className="btn btn-primary" style={{ background: "#4A2E4A", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px" }}>Browse All</Link>
            </div>
          ) : (
            <div className="products-grid">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link to="/products" className="btn btn-secondary btn-lg">View All Products →</Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section style={{ background: "#4A2E4A", color: "#F5EFF4", padding: "4rem 0" }}>
        <div className="container">
          <h2 style={{ color: "white", textAlign: "center", marginBottom: "2.5rem" }}>
            Why ChitraKaar?
          </h2>
          <div style={whyStyles.grid}>
            {[
              { icon: "🏺", title: "Authentic Craft", desc: "Every piece is handmade by skilled artisans across India." },
              { icon: "🚚", title: "Safe Delivery", desc: "Carefully packed and delivered to your doorstep." },
              { icon: "💰", title: "Fair Prices", desc: "Direct from artist — no middlemen, honest pricing." },
              { icon: "↩️", title: "Easy Returns", desc: "Not happy? Return within 7 days, no questions asked." },
            ].map((f) => (
              <div key={f.title} style={whyStyles.card}>
                <span style={whyStyles.icon}>{f.icon}</span>
                <h4 style={whyStyles.title}>{f.title}</h4>
                <p style={whyStyles.desc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function catIcon(cat) {
  const icons = { Painting: "🖼️", Sculpture: "🗿", Pottery: "🏺", Jewelry: "💍", Textile: "🧵", "Digital Art": "💻", Other: "✨" };
  return icons[cat] || "🎨";
}

const heroStyles = {
  section: {
    position: "relative", minHeight: "88vh",
    background: "linear-gradient(135deg, #FADCF2 0%, #E8BFE8 50%, #B57BB5 100%)",
    display: "flex", alignItems: "center", overflow: "hidden",
  },
  overlay: {
    position: "absolute", inset: 0,
    backgroundImage: "radial-gradient(ellipse at 70% 50%, rgba(212,160,23,0.15) 0%, transparent 60%)",
  },
  content: { position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "3rem 1.5rem", color: "#F5EFF4" },
  eyebrow: { fontSize: "0.85rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#4A2E4A", marginBottom: "1rem", fontWeight: 600 },
  title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(2.5rem, 6vw, 5rem)",
      lineHeight: 1.15,
      marginBottom: "1.25rem",
      color: "#F5EFF4",
      textShadow: `
        -1px -1px 0 #4A2E4A,
        1px -1px 0 #4A2E4A,
        -1px  1px 0 #4A2E4A,
        1px  1px 0 #4A2E4A
      `
    },
  sub: { fontSize: "1.05rem", color: "#4A2E4A", maxWidth: 480, marginBottom: "2rem", lineHeight: 1.7 },
  btns: { display: "flex", gap: "1rem", flexWrap: "wrap" },
};

const catStyles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" },
  card: {
    background: "#F5EFF4", border: "1px solid #4A2E4A", borderRadius: 12,
    padding: "1.5rem 1rem", textAlign: "center", display: "flex",
    flexDirection: "column", alignItems: "center", gap: "0.6rem",
    transition: "all 0.2s", boxShadow: "0 2px 8px rgba(44,26,14,0.06)",
    textDecoration: "none",
    cursor: "pointer",
  },
  icon: { fontSize: "2rem" },
  label: { fontSize: "0.85rem", fontWeight: 600, color: "#4A2E4A" },
};

const whyStyles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" },
  card: { textAlign: "center", padding: "1.5rem" },
  icon: { fontSize: "2.2rem", display: "block", marginBottom: "0.75rem" },
  title: { fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.1rem", marginBottom: "0.5rem" },
  desc: { fontSize: "0.88rem", color: "#F5EFF4", lineHeight: 1.6 },
};