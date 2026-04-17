import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["All", "Painting", "Sculpture", "Pottery", "Jewelry", "Textile", "Digital Art", "Other"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "All";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = Number(searchParams.get("page") || 1);

  const [search, setSearch] = useState(keyword);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (keyword) params.set("keyword", keyword);
      if (category && category !== "All") params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.set("page", "1");
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam("keyword", search);
  };

  const handlePriceFilter = () => {
    const p = new URLSearchParams(searchParams);
    if (localMin) p.set("minPrice", localMin); else p.delete("minPrice");
    if (localMax) p.set("maxPrice", localMax); else p.delete("maxPrice");
    p.set("page", "1");
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearch(""); setLocalMin(""); setLocalMax("");
    setSearchParams({});
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={styles.header}>
          <div>
            <h1 className="section-heading">Our Collection</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {total} {total === 1 ? "piece" : "pieces"} found
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              className="form-input"
              placeholder="Search artworks, artists…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: 260 }}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        <div style={styles.layout}>
          {/* Sidebar Filters */}
          <aside style={styles.sidebar}>
            <div style={styles.filterSection}>
              <h4 style={styles.filterTitle}>Category</h4>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParam("category", cat === "All" ? "" : cat)}
                  style={{
                    ...styles.catBtn,
                    ...(category === cat || (cat === "All" && !category)
                      ? styles.catBtnActive : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={styles.filterSection}>
              <h4 style={styles.filterTitle}>Price Range (₹)</h4>
              <input
                type="number"
                className="form-input"
                placeholder="Min price"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                style={{ marginBottom: "0.5rem" }}
              />
              <input
                type="number"
                className="form-input"
                placeholder="Max price"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                style={{ marginBottom: "0.75rem" }}
              />
              <button className="btn btn-primary btn-sm btn-full" onClick={handlePriceFilter}>
                Apply
              </button>
            </div>

            <button className="btn btn-outline btn-sm btn-full" onClick={clearFilters}>
              Clear All Filters
            </button>
          </aside>

          {/* Products */}
          <main style={{ flex: 1 }}>
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters.</p>
                <br />
                <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={styles.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => updateParam("page", pg)}
                        style={{ ...styles.pageBtn, ...(pg === page ? styles.pageBtnActive : {}) }}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" },
  searchForm: { display: "flex", gap: "0.5rem" },
  layout: { display: "flex", gap: "2rem", alignItems: "flex-start" },
  sidebar: { width: 220, flexShrink: 0, background: "white", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--border)", position: "sticky", top: 88 },
  filterSection: { marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.25rem" },
  filterTitle: { fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.75rem" },
  catBtn: { textAlign: "left", background: "none", border: "none", padding: "0.4rem 0.65rem", borderRadius: 6, fontSize: "0.88rem", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s" },
  catBtnActive: { background: "#fdf0ea", color: "var(--terracotta)", fontWeight: 600 },
  pagination: { display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" },
  pageBtn: { width: 36, height: 36, borderRadius: 8, border: "1.5px solid var(--border)", background: "white", cursor: "pointer", fontSize: "0.88rem", color: "var(--text-primary)" },
  pageBtnActive: { background: "var(--terracotta)", color: "white", borderColor: "var(--terracotta)" },
};