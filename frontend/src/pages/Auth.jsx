import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success("Welcome back! 🎨");
      navigate(redirect);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={authStyles.page}>
      <div style={authStyles.card}>
        <div style={authStyles.logo}>🎨</div>
        <h1 style={authStyles.title}>Welcome Back</h1>
        <p style={authStyles.sub}>Sign in to your ChitraKaar account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={authStyles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "var(--terracotta)", fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    const result = await signup(form.name, form.email, form.password);
    if (result.success) {
      toast.success("Account created! Welcome to ChitraKaar 🎨");
      navigate("/");
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={authStyles.page}>
      <div style={authStyles.card}>
        <div style={authStyles.logo}>🎨</div>
        <h1 style={authStyles.title}>Create Account</h1>
        <p style={authStyles.sub}>Join the ChitraKaar community</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required placeholder="Your name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required placeholder="Min 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" required placeholder="Re-enter password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p style={authStyles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--terracotta)", fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const authStyles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #faf6f0 0%, #f0e4d4 100%)", padding: "2rem 1rem" },
  card: { background: "white", borderRadius: 20, padding: "2.5rem", width: "100%", maxWidth: 440, boxShadow: "0 8px 40px rgba(44,26,14,0.12)", border: "1px solid var(--border)" },
  logo: { fontSize: "2.5rem", textAlign: "center", marginBottom: "0.5rem" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", textAlign: "center", marginBottom: "0.4rem" },
  sub: { color: "var(--text-muted)", textAlign: "center", fontSize: "0.9rem", marginBottom: "1.75rem" },
  footer: { textAlign: "center", marginTop: "1.5rem", fontSize: "0.88rem", color: "var(--text-muted)" },
};