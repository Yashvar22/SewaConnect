import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🔐</span>
          <h1>Welcome Back</h1>
          <p>Sign in to your SewaConnect account</p>
        </div>

        {error && <div className="alert error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1rem" }}
                aria-label="Toggle password"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} id="login-submit">
            {loading ? <span className="btn-loading"><span className="btn-spinner" />Signing in...</span> : "Sign In →"}
          </button>
        </form>

        {/* Quick-access hint */}
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--bg3)", borderRadius: "10px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text)", display: "block", marginBottom: "0.35rem" }}>🧪 Demo Accounts</strong>
          Register a new account to get started, or use existing credentials.
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register for free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
