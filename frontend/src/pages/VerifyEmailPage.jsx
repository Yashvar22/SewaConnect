import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [form, setForm] = useState({ email: initialEmail, otp: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setForm((prev) => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/verify-email", {
        email: form.email,
        otp: form.otp,
      });
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResendLoading(true);

    try {
      const { data } = await api.post("/auth/resend-verification-otp", {
        email: form.email,
      });
      setMessage(data.message || "Verification code resent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to resend code. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">✅</span>
          <h1>Verify Your Email</h1>
          <p>Enter the code we sent to your email to complete registration.</p>
        </div>

        {error && <div className="alert error">⚠️ {error}</div>}
        {message && <div className="alert success">✅ {message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="verify-email">Email Address</label>
            <input
              id="verify-email"
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
            <label htmlFor="verify-otp">Verification Code</label>
            <input
              id="verify-otp"
              name="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={form.otp}
              onChange={handleChange}
              required
              maxLength={6}
              inputMode="numeric"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="auth-actions" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            onClick={handleResend}
            className="btn-secondary"
            disabled={resendLoading || !form.email}
          >
            {resendLoading ? "Resending..." : "Resend Code"}
          </button>
        </div>

        <p className="auth-footer">
          Already verified? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
