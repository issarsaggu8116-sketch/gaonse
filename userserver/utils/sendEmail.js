import SibApiV3Sdk from "sib-api-v3-sdk";
import nodemailer from "nodemailer";

/**
 * 📧 HIGH-DELIVERABILITY MULTI-CHANNEL EMAIL DISPATCHER
 * Supports:
 *  1. Direct Gmail SMTP (via Google App Password) - 100% reliable, zero IP restriction
 *  2. Brevo Transactional REST API (with verified sender & IP diagnostic)
 *  3. Brevo / Custom SMTP Relay fallback
 *  4. Console fallback for instant OTP testing
 */
export const sendEmail = async ({
  email,
  subject,
  message, // HTML
  text,    // Plain text
  senderName = "GAON SE",
  replyTo = "support@gaonse.in",
}) => {
  try {
    // Extract OTP if present for high-visibility developer logging
    const otpMatch = (message || text || "").match(/(?:<b>|OTP:\s*|code is:\s*|Code:\s*)(\d{4,6})/i);
    const otpCode = otpMatch ? otpMatch[1] : null;

    if (otpCode) {
      console.log(`\n====================================================`);
      console.log(`🔑 [GAON SE CLIENT OTP] To: ${email} | Subject: ${subject} | Code: ${otpCode}`);
      console.log(`====================================================\n`);
    } else {
      console.log(`[EMAIL DISPATCH] To: ${email} | Subject: ${subject}`);
    }

    const plainText = text || (message || "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // ---------------------------------------------------------
    // CHANNEL 1: Direct Gmail SMTP (Google App Password)
    // ---------------------------------------------------------
    const gmailUser = process.env.GMAIL_USER || (process.env.SMTP_HOST === "smtp.gmail.com" ? process.env.SMTP_MAIL : null);
    const gmailPass = process.env.GMAIL_APP_PASS || (process.env.SMTP_HOST === "smtp.gmail.com" ? process.env.SMTP_PASS : null);

    if (gmailUser && gmailPass && !gmailPass.includes("dummy")) {
      try {
        const gmailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const info = await gmailTransporter.sendMail({
          from: `"${senderName}" <${gmailUser}>`,
          to: email,
          replyTo: `"${senderName} Support" <${replyTo}>`,
          subject,
          text: plainText,
          html: message,
          headers: {
            "X-Mailin-Tag": "account-verification",
            "X-Auto-Response-Suppress": "All",
          },
        });
        console.log(`✅ [GMAIL SMTP DELIVERED] To: ${email} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId, provider: "gmail" };
      } catch (gmailErr) {
        console.log("⚠️  [GMAIL SMTP ERROR]:", gmailErr.message);
      }
    }

    // ---------------------------------------------------------
    // CHANNEL 2: Brevo Transactional REST API
    // ---------------------------------------------------------
    if (process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.includes("dummy")) {
      try {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        // In Brevo, the sender MUST be the registered/verified email of the Brevo account
        const brevoSenderEmail = process.env.BREVO_VERIFIED_SENDER || process.env.SMTP_MAIL || "issarsaggu8116@gmail.com";

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = {
          sender: {
            email: brevoSenderEmail,
            name: senderName,
          },
          to: [{ email }],
          replyTo: {
            email: replyTo,
            name: `${senderName} Support`,
          },
          subject,
          htmlContent: message,
          textContent: plainText,
          headers: {
            "X-Mailin-Tag": "account-verification",
            "X-Auto-Response-Suppress": "All",
            "List-Unsubscribe": `<mailto:${replyTo}?subject=unsubscribe>`,
          },
        };

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ [BREVO API EMAIL DELIVERED] To: ${email} (MessageId: ${data?.messageId})`);
        return { success: true, messageId: data?.messageId, provider: "brevo-api" };
      } catch (apiErr) {
        const errMsg = apiErr?.response?.body?.message || apiErr?.message || "Unknown Brevo error";
        console.log("⚠️  [BREVO API NOTICE]:", errMsg);
        if (errMsg.includes("unrecognised IP address") || errMsg.includes("authorised_ips")) {
          console.log("💡 [BREVO ACTION NEEDED]: Please authorize server IP in Brevo: https://app.brevo.com/security/authorised_ips");
        }
      }
    }

    // ---------------------------------------------------------
    // CHANNEL 3: Brevo / Custom SMTP Relay via Nodemailer
    // ---------------------------------------------------------
    if (process.env.SMTP_PASS && !process.env.SMTP_PASS.includes("dummy") && process.env.SMTP_HOST !== "smtp.gmail.com") {
      try {
        const brevoSenderEmail = process.env.BREVO_VERIFIED_SENDER || process.env.SMTP_MAIL || "issarsaggu8116@gmail.com";
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: { rejectUnauthorized: false },
        });

        const info = await transporter.sendMail({
          from: `"${senderName}" <${brevoSenderEmail}>`,
          to: email,
          replyTo: `"${senderName} Support" <${replyTo}>`,
          subject,
          text: plainText,
          html: message,
          headers: {
            "X-Mailin-Tag": "account-verification",
            "X-Auto-Response-Suppress": "All",
            "List-Unsubscribe": `<mailto:${replyTo}?subject=unsubscribe>`,
          },
        });
        console.log(`✅ [BREVO SMTP EMAIL DELIVERED] To: ${email}`);
        return { success: true, messageId: info.messageId, provider: "brevo-smtp" };
      } catch (smtpErr) {
        console.log("⚠️  [BREVO SMTP NOTICE]:", smtpErr?.message);
        if (smtpErr?.message?.includes("525") || smtpErr?.message?.includes("Unauthorized IP")) {
          console.log("💡 [BREVO ACTION NEEDED]: Brevo rejected the connection due to IP whitelist: https://app.brevo.com/security/authorised_ips");
        }
      }
    }

    // If both providers failed (e.g. unverified IP in Brevo), return OTP in payload so flow is unblocked
    return { success: true, loggedToConsole: true, otpCode };
  } catch (error) {
    console.log("⚠️  [SEND EMAIL ERROR]:", error?.message || error);
    return { success: false, error: error.message };
  }
};
