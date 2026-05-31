import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const ROLES = [
  {
    value: "user",
    icon: "🙋",
    label: "Volunteer / Donor",
    desc: "Browse NGOs, donate, apply for events",
  },
  {
    value: "ngo",
    icon: "🏢",
    label: "NGO Representative",
    desc: "Register & manage your NGO and events",
  },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <span className="auth-icon">🌿</span>
          <h1>Join SewaConnect</h1>
          <p>Create your free account and start making a difference</p>
        </div>

        {error && <div className="alert error">⚠️ {error}</div>}

        {/* Role Selector */}
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem" }}>
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r.value }))}
              style={{
                flex: 1,
                padding: "0.9rem 0.75rem",
                border: `2px solid ${form.role === r.value ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "12px",
                background:
                  form.role === r.value ? "var(--primary-glow)" : "var(--bg3)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              <span
                style={{
                  fontSize: "1.5rem",
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                {r.icon}
              </span>
              <strong
                style={{
                  fontSize: "0.82rem",
                  color:
                    form.role === r.value ? "var(--primary)" : "var(--text)",
                  display: "block",
                }}
              >
                {r.label}
              </strong>
              <small
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.3,
                  display: "block",
                  marginTop: "0.2rem",
                }}
              >
                {r.desc}
              </small>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="reg-password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "1rem",
                }}
                aria-label="Toggle password"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {form.password && (
              <div
                style={{
                  display: "flex",
                  gap: "0.25rem",
                  marginTop: "0.35rem",
                }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background:
                        form.password.length >= i * 2
                          ? form.password.length >= 10
                            ? "var(--primary)"
                            : form.password.length >= 6
                              ? "var(--amber)"
                              : "var(--danger)"
                          : "var(--bg4)",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            id="register-submit"
          >
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                Creating account...
              </span>
            ) : (
              `Create ${form.role === "ngo" ? "NGO" : "Volunteer"} Account →`
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
