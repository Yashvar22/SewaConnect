import { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'refund' | 'contact'

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const closeModal = () => setActiveModal(null);

  // Content for Legal Modals
  const modalContent = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="legal-content">
          <p>
            <strong>Last Updated: May 2026</strong>
          </p>
          <p>
            At SewaConnect, we value your privacy and are committed to
            protecting your personal data. This Privacy Policy explains how we
            collect, use, and safeguard your information when you use our
            platform.
          </p>
          <h4>1. Information We Collect</h4>
          <p>
            We collect information you provide directly to us when you create an
            account, register as an NGO, sign up for volunteer events, or make
            donations. This includes your name, email address, contact number,
            location, and role.
          </p>
          <h4>2. Donation & Payment Security</h4>
          <p>
            All donation transactions are securely processed through Razorpay.
            We do not store your credit card or banking information on our
            servers. Razorpay complies with PCI-DSS standards to ensure top-tier
            transaction security.
          </p>
          <h4>3. How We Use Your Information</h4>
          <p>
            We use your data to facilitate connections between volunteers,
            donors, and NGOs, send OTP verifications, coordinate events, and
            improve our services. We never sell or rent your personal
            information to third parties.
          </p>
          <h4>4. Contact Support</h4>
          <p>
            For any queries regarding your data privacy, you can reach out to us
            at <strong>contactsewaconnect@gmail.com</strong>.
          </p>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      content: (
        <div className="legal-content">
          <p>
            <strong>Last Updated: May 2026</strong>
          </p>
          <p>
            Welcome to SewaConnect. By accessing or using our website, you agree
            to comply with and be bound by the following Terms & Conditions.
            Please review them carefully.
          </p>
          <h4>1. Eligibility & User Accounts</h4>
          <p>
            You must be at least 18 years old or have parental consent to use
            this platform. You are responsible for maintaining the
            confidentiality of your account credentials and all activities under
            your account.
          </p>
          <h4>2. NGO Verification</h4>
          <p>
            NGOs registering on SewaConnect must provide valid registration
            documents. Verification is handled by our administrative team. We
            reserve the right to suspend or reject any NGO profile containing
            inaccurate, outdated, or fraudulent information.
          </p>
          <h4>3. Volunteer Engagement</h4>
          <p>
            Volunteers agree to behave responsibly and respectfully during
            registered events. SewaConnect facilitates connections but is not
            liable for disputes or incidents occurring during real-world
            volunteer activities.
          </p>
          <h4>4. Limitation of Liability</h4>
          <p>
            SewaConnect serves as a bridge for social good. We are not
            responsible for the performance, actions, or omissions of any NGOs,
            volunteers, or donor actions on the platform.
          </p>
        </div>
      ),
    },
    refund: {
      title: "Refund & Cancellation Policy",
      content: (
        <div className="legal-content">
          <p>
            <strong>Last Updated: May 2026</strong>
          </p>
          <p>
            We thank you for supporting verified social causes on SewaConnect.
            Please read our donation refund policy carefully.
          </p>
          <h4>1. Nature of Donations</h4>
          <p>
            All donations made on SewaConnect are voluntary. Because
            contributions go directly toward supporting non-profit events and
            operations, donations are generally non-refundable once processed.
          </p>
          <h4>2. Technical Errors & Double Charges</h4>
          <p>
            In the event of a technical glitch, transaction failure, or
            duplicate debit, please contact our support team immediately.
            Verified double charges or system errors will be refunded to the
            original payment source within <strong>5 to 7 business days</strong>
            .
          </p>
          <h4>3. Refund Requests</h4>
          <p>
            To report a transaction issue, email us at{" "}
            <strong>contactsewaconnect@gmail.com</strong> with your transaction
            ID, name, registered email, and proof of payment.
          </p>
        </div>
      ),
    },
    contact: {
      title: "Contact Us & Support",
      content: (
        <div className="legal-content">
          <p>
            Have questions, feedback, or need assistance? We are here to help
            you coordinate your social initiatives.
          </p>
          <div className="contact-card-box">
            <p>
              <strong>📧 Email Support:</strong>
              <br />
              <a
                href="mailto:contactsewaconnect@gmail.com"
                style={{ color: "var(--primary)" }}
              >
                contactsewaconnect@gmail.com
              </a>
            </p>
            <p style={{ marginTop: "1rem" }}>
              <strong>📞 Phone Support:</strong>
              <br />
              +91 9305966463 (Mon-Fri, 10:00 AM - 6:00 PM IST)
            </p>
          </div>
          <h4 style={{ marginTop: "1.5rem" }}>Submit a Support Request</h4>
          <p>
            For escalation of verification issues, email us at{" "}
            <strong>contactsewaconnect@gmail.com</strong> with your registered
            NGO PAN card details and verification ID.
          </p>
        </div>
      ),
    },
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.75rem" }}>🌿</span>
            <span className="footer-brand-text">SewaConnect</span>
          </div>
          <p style={{ marginTop: "0.5rem" }}>
            A secure, verified platform bridging NGOs, volunteers, and donors to
            create transparent, lasting social impact across communities in
            India.
          </p>

          <div
            className="social-links-row"
            style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}
          >
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="GitHub"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="LinkedIn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="Twitter/X"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="Instagram"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/ngos">Browse NGOs</Link>
            <Link to="/events">Volunteer Opportunities</Link>
            <Link to="/donate">Make a Donation</Link>
            <span
              className="footer-link-btn"
              onClick={() => setActiveModal("contact")}
            >
              Contact Support
            </span>
          </div>

          <div className="footer-col">
            <h4>Legal & Safety</h4>
            <span
              className="footer-link-btn"
              onClick={() => setActiveModal("privacy")}
            >
              Privacy Policy
            </span>
            <span
              className="footer-link-btn"
              onClick={() => setActiveModal("terms")}
            >
              Terms of Service
            </span>
            <span
              className="footer-link-btn"
              onClick={() => setActiveModal("refund")}
            >
              Refund Policy
            </span>
            <Link to="/register">Create Account</Link>
          </div>

          <div className="footer-col newsletter-col">
            <h4>Join Our Newsletter</h4>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.82rem",
                lineHeight: 1.5,
                marginBottom: "0.75rem",
              }}
            >
              Stay updated on verified NGO updates, relief campaigns, and new
              volunteering drives in India.
            </p>
            {subscribed ? (
              <div
                style={{
                  color: "var(--accent)",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.4rem 0.5rem",
                }}
              >
                <span>✨</span> Thank you for subscribing!
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="newsletter-form-inline"
                style={{ display: "flex", gap: "0.4rem" }}
              >
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: "0.45rem 0.75rem",
                    fontSize: "0.82rem",
                    borderRadius: "8px",
                    border: "1.5px solid var(--border)",
                    background: "var(--bg)",
                    width: "100%",
                  }}
                  required
                />
                <button
                  type="submit"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--primary-dim))",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.45rem 0.85rem",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px var(--primary-glow)",
                  }}
                >
                  Join
                </button>
              </form>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginTop: "1.25rem",
              }}
            >
              <span className="operational-pulse" />
              <small
                style={{
                  color: "var(--accent)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                All systems operational
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem",
            flexWrap: "wrap",
          }}
        >
          <span>
            © {new Date().getFullYear()} SewaConnect. Built for social good.
          </span>
          <span style={{ color: "var(--text-dim)" }}>•</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            Made in India 🇮🇳
          </span>
        </p>
      </div>

      {/* Legal & Contact Modal */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-box legal-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{modalContent[activeModal].title}</h2>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: "0.5rem 0" }}>
              {modalContent[activeModal].content}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
