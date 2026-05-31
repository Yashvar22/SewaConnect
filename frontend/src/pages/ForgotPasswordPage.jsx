import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const ForgotPasswordPage = () => {
  const [stage, setStage] = useState("request");
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const requestReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/request-password-reset", {
        email: form.email,
      });
      setMessage(data.message || "A reset code has been sent to your email.");
      setStage("reset");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send reset code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        email: form.email,
        otp: form.otp,
        password: form.password,
      });
      setMessage(
        data.message || "Password reset successfully. Please sign in.",
      );
      setStage("complete");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🔄</span>
          <h1>
            {stage === "request"
              ? "Forgot Password"
              : stage === "reset"
                ? "Reset Password"
                : "Password Reset Complete"}
          </h1>
          <p>
            {stage === "request"
              ? "Enter your email to receive a password reset code."
              : stage === "reset"
                ? "Enter the code from your email and set a new password."
                : "Your password has been reset. You can now sign in with your new password."}
          </p>
        </div>

        {error && <div className="alert error">⚠️ {error}</div>}
        {message && <div className="alert success">✅ {message}</div>}

        {stage === "complete" ? (
          <p className="auth-footer">
            <Link to="/login">Go to sign in</Link>
          </p>
        ) : (
          <form
            onSubmit={stage === "request" ? requestReset : resetPassword}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            {stage === "reset" && (
              <>
                <div className="form-group">
                  <label htmlFor="reset-otp">Reset Code</label>
                  <input
                    id="reset-otp"
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
                <div className="form-group">
                  <label htmlFor="reset-password">New Password</label>
                  <input
                    id="reset-password"
                    name="password"
                    type="password"
                    placeholder="New password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Processing..."
                : stage === "request"
                  ? "Send Reset Code"
                  : "Reset Password"}
            </button>
          </form>
        )}

        {stage !== "complete" && (
          <p className="auth-footer">
            Remembered your password? <Link to="/login">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
