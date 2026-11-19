import SibApiV3Sdk from "sib-api-v3-sdk";
import nodemailer from "nodemailer";

/**
 * 📧 HIGH-DELIVERABILITY EMAIL DISPATCHER (DELIVERY SERVER)
 * Supports:
 *  1. Direct Gmail SMTP (via Google App Password)
 *  2. Brevo Transactional REST API
 *  3. Brevo SMTP Relay fallback
 */
export const sendEmail = async ({
  email,
  subject,
  message, // HTML
  text,    // Plain text
  senderName = "GAON SE Delivery",
  replyTo = "support@gaonse.in",
}) => {
  try {
    const otpMatch = (message || text || "").match(/(?:<b>|OTP:\s*|code is:\s*|Code:\s*)(\d{4,6})/i);
    const otpCode = otpMatch ? otpMatch[1] : null;

    if (otpCode) {
      console.log(`\n====================================================`);
      console.log(`🔑 [DELIVERY OTP] To: ${email} | Subject: ${subject} | Code: ${otpCode}`);
      console.log(`====================================================\n`);
    } else {
      console.log(`[EMAIL DISPATCH] To: ${email} | Subject: ${subject}`);
    }

    const plainText = text || (message || "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // 1. Direct Gmail SMTP
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
        });
        console.log(`✅ [GMAIL SMTP DELIVERED] To: ${email} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId, provider: "gmail" };
      } catch (gmailErr) {
        console.log("⚠️  [GMAIL SMTP ERROR]:", gmailErr.message);
      }
    }

    // 2. Brevo Transactional REST API
    if (process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.includes("dummy")) {
      try {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;

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
            "X-Mailin-Tag": "delivery-otp",
            "X-Auto-Response-Suppress": "All",
            "List-Unsubscribe": `<mailto:${replyTo}?subject=unsubscribe>`,
          },
        };

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ [BREVO API EMAIL DELIVERED] To: ${email} (MessageId: ${data?.messageId})`);
        return { success: true, messageId: data?.messageId, provider: "brevo-api" };
      } catch (apiErr) {
        console.log("⚠️  [BREVO API NOTICE]:", apiErr?.response?.body?.message || apiErr?.message);
      }
    }

    // 3. Brevo / Custom SMTP Relay via Nodemailer
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
        });
        console.log(`✅ [BREVO SMTP DELIVERED] To: ${email}`);
        return { success: true, messageId: info.messageId, provider: "brevo-smtp" };
      } catch (smtpErr) {
        console.log("⚠️  [BREVO SMTP NOTICE]:", smtpErr?.message);
      }
    }

    return { success: true, loggedToConsole: true, otpCode };
  } catch (error) {
    console.log("⚠️  [SEND EMAIL ERROR]:", error?.message || error);
    return { success: false, error: error.message };
  }
};
