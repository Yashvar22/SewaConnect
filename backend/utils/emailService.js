const nodemailer = require("nodemailer");

// ── Transporter ───────────────────────────────────────────────────
// Uses Gmail SMTP. Set EMAIL_USER + EMAIL_PASS (App Password) in .env
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ── Shared HTML wrapper ───────────────────────────────────────────
const wrap = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">🌍</div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">SewaConnect</h1>
            <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Connecting hearts, building communities</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#1e293b;padding:36px 40px;border-left:1px solid #334155;border-right:1px solid #334155;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#1e293b;padding:20px 40px 28px;border-radius:0 0 16px 16px;border:1px solid #334155;border-top:1px solid #334155;text-align:center;">
            <p style="color:#64748b;font-size:12px;margin:0;">
              You received this email because you are registered on <strong style="color:#94a3b8;">SewaConnect</strong>.<br/>
              &copy; ${new Date().getFullYear()} SewaConnect. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Helper: safe send ─────────────────────────────────────────────
const sendMail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email] Skipped (no credentials) → ${subject} → ${to}`);
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SewaConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] ✅ Sent → ${subject} → ${to}`);
  } catch (err) {
    console.error(`[Email] ❌ Failed → ${err.message}`);
  }
};

const createOtpMessage = (headline, bodyText) => `
    <h2 style="color:#10b981;margin:0 0 8px;font-size:20px;">${headline}</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;line-height:1.6;">${bodyText}</p>
    <div style="background:#0f172a;border-radius:12px;padding:24px;margin-bottom:28px;border-left:4px solid #10b981;text-align:center;">
      <p style="color:#fff;font-size:32px;letter-spacing:0.2em;margin:0;">%CODE%</p>
      <p style="color:#94a3b8;margin:18px 0 0;font-size:14px;line-height:1.7;">This code expires in 10 minutes.</p>
    </div>`;

const sendEmailVerificationOtp = async ({ to, name, otp }) => {
  const body = createOtpMessage(
    `Verify your email address, ${name}`,
    `Enter the 6-digit verification code below to complete your SewaConnect registration.`,
  ).replace("%CODE%", otp);
  await sendMail({
    to,
    subject: "Your SewaConnect Email Verification Code",
    html: wrap("Verify Your Email", body),
  });
};

const sendPasswordResetOtp = async ({ to, name, otp }) => {
  const body = createOtpMessage(
    `Password reset requested`,
    `Use the 6-digit code below to reset your SewaConnect password.`,
  ).replace("%CODE%", otp);
  await sendMail({
    to,
    subject: "SewaConnect Password Reset Code",
    html: wrap("Reset Your Password", body),
  });
};

// ─────────────────────────────────────────────────────────────────
// 1. NGO VERIFIED
// ────────────────────────────────────────────────────────────────
const sendNGOVerifiedEmail = async ({ to, ngoName, ownerName }) => {
  const body = `
    <h2 style="color:#10b981;margin:0 0 8px;font-size:20px;">🎉 Congratulations, ${ownerName}!</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;line-height:1.6;">
      Your NGO <strong style="color:#e2e8f0;">${ngoName}</strong> has been <strong style="color:#10b981;">verified</strong> by our admin team.
      You can now create events, receive donations, and manage volunteers on the platform!
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin-bottom:28px;border-left:4px solid #10b981;">
      <p style="color:#94a3b8;margin:0;font-size:14px;line-height:1.7;">
        ✅ Your NGO listing is now <strong style="color:#e2e8f0;">publicly visible</strong><br/>
        📅 You can start <strong style="color:#e2e8f0;">creating events</strong> immediately<br/>
        💝 Donors can now <strong style="color:#e2e8f0;">contribute</strong> to your cause
      </p>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard"
        style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        Go to Dashboard →
      </a>
    </div>`;
  await sendMail({
    to,
    subject: `✅ Your NGO "${ngoName}" has been Verified! — SewaConnect`,
    html: wrap("NGO Verified", body),
  });
};

// ────────────────────────────────────────────────────────────────
// 2. NGO REJECTED
// ────────────────────────────────────────────────────────────────
const sendNGORejectedEmail = async ({ to, ngoName, ownerName, reason }) => {
  const body = `
    <h2 style="color:#f87171;margin:0 0 8px;font-size:20px;">Update on Your NGO Registration</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${ownerName}</strong>, after reviewing your application for
      <strong style="color:#e2e8f0;">${ngoName}</strong>, our admin team was unable to verify it at this time.
    </p>
    ${
      reason
        ? `
    <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin-bottom:28px;border-left:4px solid #f87171;">
      <p style="color:#94a3b8;margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Reason</p>
      <p style="color:#e2e8f0;margin:0;font-size:14px;line-height:1.6;">${reason}</p>
    </div>`
        : ""
    }
    <p style="color:#94a3b8;margin:0 0 28px;font-size:14px;line-height:1.6;">
      You may update your NGO profile with accurate information and request re-verification from your dashboard.
    </p>
    <div style="text-align:center;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard"
        style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        Update My Profile →
      </a>
    </div>`;
  await sendMail({
    to,
    subject: `Update on Your NGO Registration — SewaConnect`,
    html: wrap("NGO Rejected", body),
  });
};

// ────────────────────────────────────────────────────────────────
// 3. NEW VOLUNTEER APPLICATION (to NGO)
// ────────────────────────────────────────────────────────────────
const sendNewVolunteerApplicationEmail = async ({
  to,
  ngoName,
  eventTitle,
  volunteerName,
  volunteerEmail,
}) => {
  const body = `
    <h2 style="color:#e2e8f0;margin:0 0 8px;font-size:20px;">🙋 New Volunteer Application!</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;line-height:1.6;">
      <strong style="color:#6366f1;">${volunteerName}</strong> has applied to volunteer for your event.
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin-bottom:28px;border:1px solid #334155;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#64748b;font-size:13px;padding:6px 0;">📅 Event</td>
          <td style="color:#e2e8f0;font-size:14px;font-weight:600;padding:6px 0;text-align:right;">${eventTitle}</td>
        </tr>
        <tr><td colspan="2" style="border-top:1px solid #334155;height:1px;padding:0;"></td></tr>
        <tr>
          <td style="color:#64748b;font-size:13px;padding:6px 0;">👤 Volunteer</td>
          <td style="color:#e2e8f0;font-size:14px;font-weight:600;padding:6px 0;text-align:right;">${volunteerName}</td>
        </tr>
        <tr><td colspan="2" style="border-top:1px solid #334155;height:1px;padding:0;"></td></tr>
        <tr>
          <td style="color:#64748b;font-size:13px;padding:6px 0;">📧 Email</td>
          <td style="color:#6366f1;font-size:14px;padding:6px 0;text-align:right;">${volunteerEmail}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard"
        style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        Review Application →
      </a>
    </div>`;
  await sendMail({
    to,
    subject: `🙋 New Volunteer for "${eventTitle}" — SewaConnect`,
    html: wrap("New Volunteer Application", body),
  });
};

// ────────────────────────────────────────────────────────────────
// 4a. VOLUNTEER APPROVED (to volunteer)
// ────────────────────────────────────────────────────────────────
const sendVolunteerApprovedEmail = async ({
  to,
  volunteerName,
  eventTitle,
  ngoName,
  eventDate,
  eventLocation,
}) => {
  const dateStr = eventDate
    ? new Date(eventDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date TBD";
  const body = `
    <h2 style="color:#10b981;margin:0 0 8px;font-size:20px;">🎉 You're In, ${volunteerName}!</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;line-height:1.6;">
      Your volunteer application has been <strong style="color:#10b981;">approved</strong> by <strong style="color:#e2e8f0;">${ngoName}</strong>.
      Get ready to make a difference!
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin-bottom:28px;border:1px solid #10b981;border-left-width:4px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#64748b;font-size:13px;padding:6px 0;">📅 Event</td>
          <td style="color:#e2e8f0;font-size:14px;font-weight:600;padding:6px 0;text-align:right;">${eventTitle}</td>
        </tr>
        <tr><td colspan="2" style="border-top:1px solid #334155;height:1px;padding:0;"></td></tr>
        <tr>
          <td style="color:#64748b;font-size:13px;padding:6px 0;">🏢 NGO</td>
          <td style="color:#e2e8f0;font-size:14px;padding:6px 0;text-align:right;">${ngoName}</td>
        </tr>
        <tr><td colspan="2" style="border-top:1px solid #334155;height:1px;padding:0;"></td></tr>
        <tr>
          <td style="color:#64748b;font-size:13px;padding:6px 0;">🗓️ Date</td>
          <td style="color:#e2e8f0;font-size:14px;padding:6px 0;text-align:right;">${dateStr}</td>
        </tr>
        ${
          eventLocation
            ? `
        <tr><td colspan="2" style="border-top:1px solid #334155;height:1px;padding:0;"></td></tr>
        <tr>
          <td style="color:#64748b;font-size:13px;padding:6px 0;">📍 Location</td>
          <td style="color:#e2e8f0;font-size:14px;padding:6px 0;text-align:right;">${eventLocation}</td>
        </tr>`
            : ""
        }
      </table>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard"
        style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        View My Applications →
      </a>
    </div>`;
  await sendMail({
    to,
    subject: `✅ Volunteer Application Approved — ${eventTitle}`,
    html: wrap("Application Approved", body),
  });
};

// ────────────────────────────────────────────────────────────────
// 4b. VOLUNTEER REJECTED (to volunteer)
// ────────────────────────────────────────────────────────────────
const sendVolunteerRejectedEmail = async ({
  to,
  volunteerName,
  eventTitle,
  ngoName,
}) => {
  const body = `
    <h2 style="color:#e2e8f0;margin:0 0 8px;font-size:20px;">Update on Your Application</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${volunteerName}</strong>, unfortunately your application for
      <strong style="color:#e2e8f0;">${eventTitle}</strong> hosted by <strong style="color:#e2e8f0;">${ngoName}</strong>
      was not accepted this time.
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px 24px;margin-bottom:28px;border-left:4px solid #f87171;">
      <p style="color:#94a3b8;margin:0;font-size:14px;line-height:1.7;">
        Don't be discouraged! There are many more events you can apply for.<br/>
        Browse all upcoming events and find your next opportunity to make an impact! 💪
      </p>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/events"
        style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        Browse More Events →
      </a>
    </div>`;
  await sendMail({
    to,
    subject: `Update on Your Volunteer Application — SewaConnect`,
    html: wrap("Application Update", body),
  });
};

module.exports = {
  sendNGOVerifiedEmail,
  sendNGORejectedEmail,
  sendNewVolunteerApplicationEmail,
  sendVolunteerApprovedEmail,
  sendVolunteerRejectedEmail,
  sendEmailVerificationOtp,
  sendPasswordResetOtp,
};
