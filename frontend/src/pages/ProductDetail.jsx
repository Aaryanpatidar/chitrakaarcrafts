import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const PLACEHOLDER = "https://placehold.co/600x450/FADCF2/4A2E4A?text=Art";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(`Added ${qty} × "${product.name}" to cart!`);
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return <div className="container page-wrapper"><p>Product not found.</p></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/products" style={{ color: "var(--terracotta)", fontSize: "0.9rem", marginBottom: "1.5rem", display: "inline-block" }}>
          ← Back to Collection
        </Link>
        <div style={styles.grid}>
          {/* Image */}
          <div style={styles.imageWrap}>
            <img
              src={product.image || PLACEHOLDER}
              alt={product.name}
              style={styles.image}
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>

          {/* Info */}
          <div style={styles.info}>
            <span style={styles.category}>{product.category}</span>
            <h1 style={styles.name}>{product.name}</h1>
            <p style={styles.artist}>by <strong>{product.artist}</strong></p>
            <p style={styles.price}>₹{product.price.toLocaleString("en-IN")}</p>

            <div style={styles.stockBadge}>
              {product.stock > 0 ? (
                <span className="badge badge-success">✓ In Stock ({product.stock} left)</span>
              ) : (
                <span className="badge badge-danger">Out of Stock</span>
              )}
            </div>

            <p style={styles.desc}>{product.description}</p>

            {product.stock > 0 && (
              <div style={styles.addRow}>
                <div style={styles.qtyRow}>
                  <button className="btn btn-outline btn-sm" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span style={styles.qtyNum}>{qty}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAdd} style={{ flex: 1 }}>
                  🛒 Add to Cart
                </button>
              </div>
            )}

            <div style={styles.meta}>
              <span>🏷️ Category: {product.category}</span>
              <span>📦 Stock: {product.stock}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" },
  imageWrap: { borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--sand)" },
  image: { width: "100%", aspectRatio: "4/3", objectFit: "cover" },
  category: { fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--terracotta)", fontWeight: 700 },
  name: { fontFamily: "'Playfair Display', serif", fontSize: "2rem", margin: "0.4rem 0 0.25rem" },
  artist: { color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" },
  price: { fontSize: "2rem", fontWeight: 700, color: "var(--terracotta)", marginBottom: "0.75rem" },
  stockBadge: { marginBottom: "1rem" },
  desc: { color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "1.5rem", fontSize: "0.95rem" },
  addRow: { display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem" },
  qtyRow: { display: "flex", alignItems: "center", gap: "0.5rem", border: "1.5px solid var(--border)", borderRadius: 8, padding: "0 0.5rem" },
  qtyNum: { width: 32, textAlign: "center", fontWeight: 600 },
  meta: { display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" },
};