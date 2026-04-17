import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const PLACEHOLDER = "https://placehold.co/400x300/e8d5b7/5c3d2e?text=Art";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product);
    toast.success(`"${product.name}" added to cart!`);
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image || PLACEHOLDER}
          alt={product.name}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {product.stock === 0 && (
          <div style={styles.outOfStock}>Out of Stock</div>
        )}
        {product.isFeatured && (
          <div style={styles.featuredBadge}>✦ Featured</div>
        )}
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-artist">by {product.artist}</p>
        <div className="product-footer">
          <span className="product-price">₹{product.price.toLocaleString("en-IN")}</span>
          <button
            className={`btn btn-sm ${product.stock === 0 ? "btn-outline" : "btn-primary"}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  outOfStock: {
    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    background: "rgba(0,0,0,0.55)", color: "white", padding: "0.4rem 1rem",
    borderRadius: 6, fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap",
  },
  featuredBadge: {
    position: "absolute", top: 10, left: 10,
    background: "#d4a017", color: "white", padding: "0.2rem 0.6rem",
    borderRadius: 4, fontSize: "0.72rem", fontWeight: 700,
  },
};