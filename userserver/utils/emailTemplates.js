/**
 * 🎨 GAON SE ANTI-SPAM EMAIL TEMPLATES
 * Engineered to comply with Google & Yahoo 2024 Bulk/Transactional Sender Requirements:
 * - Proper DOCTYPE, HTML, HEAD, BODY structure
 * - Explicit Text counterpart for MIME multipart/alternative (eliminates HTML_SHORT_NO_TEXT spam penalty)
 * - Clear branding and context (who is sending and why)
 * - Security warnings (protects against phishing heuristics)
 * - CAN-SPAM compliant sender identity and support links
 */

const baseEmailWrapper = ({ title, preheader, contentHtml }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <!-- Preview Text (Hidden from visual view, displayed in inbox snippet) -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #ffffff; opacity: 0;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 14px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); overflow: hidden; border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Brand Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">GAON SE</h1>
              <p style="margin: 6px 0 0; color: #bbf7d0; font-size: 13px; font-weight: 500;">Pure & Natural Farm Produce • Directly to Your Home</p>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 36px 30px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Regulatory & Trust Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 6px; font-weight: 600; color: #334155;">GAON SE Agricultural & Dairy Services</p>
              <p style="margin: 0 0 8px;">Direct farm-to-table delivery of unadulterated milk and village produce.</p>
              <p style="margin: 0;">Need assistance? Contact our team at <a href="mailto:support@gaonse.in" style="color: #15803d; font-weight: 600; text-decoration: none;">support@gaonse.in</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const getRegistrationOtpTemplate = (code, name = "Customer") => {
  const subject = `Your GAON SE Verification Code is ${code}`;
  const preheader = `Use verification code ${code} to complete your registration on GAON SE. Valid for 10 minutes.`;

  const contentHtml = `
    <h2 style="margin: 0 0 14px; font-size: 20px; color: #0f172a; font-weight: 700;">Welcome to GAON SE, ${name}!</h2>
    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
      Thank you for registering with <strong>GAON SE</strong>. To activate your account and verify your email address, please use the one-time verification code below:
    </p>

    <!-- OTP Display Box -->
    <div style="background-color: #f0fdf4; border: 2px dashed #4ade80; border-radius: 10px; padding: 22px 20px; text-align: center; margin: 26px 0;">
      <div style="font-size: 11px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Verification Code (OTP)</div>
      <div style="font-size: 34px; font-weight: 800; color: #15803d; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">${code}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 8px;">⏱️ Valid for 10 minutes</div>
    </div>

    <!-- Security & Trust Information -->
    <div style="background-color: #f8fafc; border-left: 4px solid #15803d; border-radius: 0 6px 6px 0; padding: 12px 16px; margin: 24px 0 16px;">
      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #475569;">
        🔒 <strong>Security Notice:</strong> GAON SE team members will never ask for your password or OTP. Never share this code with anyone.
      </p>
    </div>

    <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
      If you did not initiate this registration, please disregard this email or report to <a href="mailto:support@gaonse.in" style="color: #64748b;">support@gaonse.in</a>.
    </p>
  `;

  const text = `Hello ${name},

Welcome to GAON SE!

Your one-time account verification code is: ${code}

This code is valid for 10 minutes. For your security, please do not share this code with anyone.

If you did not request this verification, you can safely disregard this message.

Need help? Contact support@gaonse.in
GAON SE • Pure & Preservative-Free Farm Produce
`;

  return {
    subject,
    html: baseEmailWrapper({ title: "GAON SE Account Verification", preheader, contentHtml }),
    text,
  };
};

export const getForgotPasswordOtpTemplate = (otp, name = "Customer") => {
  const subject = `GAON SE - Password Reset Code: ${otp}`;
  const preheader = `Use code ${otp} to reset your GAON SE account password. Valid for 10 minutes.`;

  const contentHtml = `
    <h2 style="margin: 0 0 14px; font-size: 20px; color: #0f172a; font-weight: 700;">Password Reset Request</h2>
    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
      Hello <strong>${name}</strong>, we received a request to reset the password for your GAON SE account. Please use the verification code below:
    </p>

    <!-- OTP Display Box -->
    <div style="background-color: #fef2f2; border: 2px dashed #f87171; border-radius: 10px; padding: 22px 20px; text-align: center; margin: 26px 0;">
      <div style="font-size: 11px; color: #991b1b; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Reset Password Code</div>
      <div style="font-size: 34px; font-weight: 800; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">${otp}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 8px;">⏱️ Valid for 10 minutes</div>
    </div>

    <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; border-radius: 0 6px 6px 0; padding: 12px 16px; margin: 24px 0 16px;">
      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #475569;">
        🔒 If you did not request a password reset, your account is still secure. Please contact <a href="mailto:support@gaonse.in" style="color: #dc2626;">support@gaonse.in</a> immediately.
      </p>
    </div>
  `;

  const text = `Hello ${name},

A request was made to reset your GAON SE account password.

Your verification code is: ${otp}

This code is valid for 10 minutes. If you did not request this, please contact support@gaonse.in immediately.

GAON SE Support Team
`;

  return {
    subject,
    html: baseEmailWrapper({ title: "GAON SE Password Reset", preheader, contentHtml }),
    text,
  };
};

export const getEmailUpdateOtpTemplate = (code, name = "Customer") => {
  const subject = `GAON SE - Profile Email Verification: ${code}`;
  const preheader = `Use code ${code} to verify your new email address on GAON SE. Valid for 10 minutes.`;

  const contentHtml = `
    <h2 style="margin: 0 0 14px; font-size: 20px; color: #0f172a; font-weight: 700;">Verify Your New Email</h2>
    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
      Hello <strong>${name}</strong>, please use the code below to confirm this new email address on your GAON SE profile:
    </p>

    <!-- OTP Display Box -->
    <div style="background-color: #f0fdf4; border: 2px dashed #4ade80; border-radius: 10px; padding: 22px 20px; text-align: center; margin: 26px 0;">
      <div style="font-size: 11px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Verification Code</div>
      <div style="font-size: 34px; font-weight: 800; color: #15803d; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">${code}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 8px;">⏱️ Valid for 10 minutes</div>
    </div>
  `;

  const text = `Hello ${name},

Please use the code below to verify your new email address on GAON SE:

Code: ${code}

Valid for 10 minutes.

GAON SE Support Team
`;

  return {
    subject,
    html: baseEmailWrapper({ title: "GAON SE Email Verification", preheader, contentHtml }),
    text,
  };
};
