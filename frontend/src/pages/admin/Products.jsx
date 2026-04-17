import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Painting", "Sculpture", "Pottery", "Jewelry", "Textile", "Digital Art", "Other"];
const EMPTY_FORM = { name: "", description: "", price: "", category: "Painting", stock: "", artist: "", image: "", isFeatured: false };

// ─── Product List ───────────────────────────────────────
export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchProducts = async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?page=${pg}&limit=10`);
       console.log("API response:", data);
      setProducts(Array.isArray(data?.products) ? data.products : []);
      setPages(Number(data?.pages) || 1);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 className="section-heading">Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : !products || products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <h3>No products yet</h3>
          <Link to="/admin/products/new" className="btn btn-primary" style={{ marginTop: "1rem" }}>Add First Product</Link>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Featured</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={styles.tr}>
                  <td style={styles.td}>
                    <img src={p.image || "https://placehold.co/48x48/e8d5b7/5c3d2e?text=Art"} alt={p.name} style={styles.thumb} onError={(e) => { e.target.src = "https://placehold.co/48x48/e8d5b7/5c3d2e?text=Art"; }} />
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600, maxWidth: 200 }}>
                    <span title={p.name} style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                    <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>by {p.artist}</span>
                  </td>
                  <td style={styles.td}><span className="badge badge-neutral">{p.category}</span></td>
                  <td style={{ ...styles.td, color: "var(--terracotta)", fontWeight: 600 }}>₹{p.price.toLocaleString("en-IN")}</td>
                  <td style={styles.td}>
                    <span className={`badge ${p.stock === 0 ? "badge-danger" : p.stock < 5 ? "badge-warning" : "badge-success"}`}>{p.stock}</span>
                  </td>
                  <td style={styles.td}>{p.isFeatured ? "✦" : "—"}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link to={`/admin/products/${p._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {Number(pages) > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem" }}>
              {Array.from({ length: Number(pages) || 1 }, (_, i) => i + 1).map((pg) => (
                <button key={pg} className="btn btn-sm" onClick={() => fetchProducts(pg)}
                  style={{ background: pg === page ? "var(--terracotta)" : "white", color: pg === page ? "white" : "var(--text-primary)", border: "1.5px solid var(--border)" }}>
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add / Edit Form ────────────────────────────────────
export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(({ data }) => setForm({
          name: data.name, description: data.description, price: data.price,
          category: data.category, stock: data.stock, artist: data.artist,
          image: data.image, isFeatured: data.isFeatured,
        }))
        .catch(() => toast.error("Product not found"))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success("Product updated!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created!");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 className="section-heading">{isEdit ? "Edit Product" : "Add New Product"}</h1>
        <Link to="/admin/products" className="btn btn-outline">← Back</Link>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div style={styles.twoCol}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Madhubani Village Scene" />
            </div>
            <div className="form-group">
              <label className="form-label">Artist Name *</label>
              <input className="form-input" name="artist" required value={form.artist} onChange={handleChange} placeholder="Artist's name" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" name="description" required value={form.description} onChange={handleChange} placeholder="Describe the artwork, materials, dimensions, etc." rows={4} />
          </div>

          <div style={styles.threeCol}>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" name="price" type="number" required min={0} value={form.price} onChange={handleChange} placeholder="e.g. 2500" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input className="form-input" name="stock" type="number" required min={0} value={form.stock} onChange={handleChange} placeholder="e.g. 10" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input className="form-input" name="image" value={form.image} onChange={handleChange} placeholder="https://example.com/image.jpg" />
            {form.image && (
              <img src={form.image} alt="preview" style={styles.preview} onError={(e) => { e.target.style.display = "none"; }} />
            )}
          </div>

          <label style={styles.checkLabel}>
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} style={{ accentColor: "var(--terracotta)" }} />
            <span>Mark as Featured Product (shown on homepage)</span>
          </label>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
            </button>
            <Link to="/admin/products" className="btn btn-outline btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  tableWrap: { background: "white", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" },
  thead: { background: "var(--cream)" },
  th: { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600 },
  tr: { borderBottom: "1px solid var(--border)", transition: "background 0.15s" },
  td: { padding: "0.75rem 1rem", color: "var(--text-secondary)", verticalAlign: "middle" },
  thumb: { width: 48, height: 48, objectFit: "cover", borderRadius: 6, background: "var(--sand)" },
  formCard: { background: "white", borderRadius: 16, padding: "2rem", border: "1px solid var(--border)" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  threeCol: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" },
  preview: { width: 120, height: 90, objectFit: "cover", borderRadius: 8, marginTop: "0.5rem", border: "1px solid var(--border)" },
  checkLabel: { display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--text-secondary)" },
};