import nodemailer from "nodemailer";

/** Singleton transporter — reused across requests */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ""),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send a password reset OTP email.
 */
export async function sendOtpEmail(to: string, otp: string) {
  const from = process.env.SMTP_FROM || `"Flixo" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: "Your Flixo Password Reset Code",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Flixo Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#0D0A0B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0A0B;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#1D1516;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
          <!-- Header gradient bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#FF4D8D,#C13DFF);height:4px;"></td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 40px 0;">
              <span style="font-size:28px;font-weight:900;color:#FF4D8D;letter-spacing:-1px;">Flixo</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#F7DBDE;">Reset Your Password</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#A28D90;line-height:1.6;">
                We received a request to reset your Flixo password. Use the code below — it expires in <strong style="color:#F7DBDE;">10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background:#0D0A0B;border:1px solid rgba(255,77,141,0.2);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#A28D90;letter-spacing:3px;text-transform:uppercase;">Verification Code</p>
                <p style="margin:0;font-size:42px;font-weight:900;letter-spacing:12px;color:#FF4D8D;font-family:monospace;">${otp}</p>
              </div>
              <p style="margin:0 0 8px;font-size:13px;color:#A28D90;line-height:1.6;">
                Enter this code on the verification page. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:12px;color:#877276;">
                For security, this code is valid for <strong>10 minutes only</strong> and can only be used once.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px 24px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:11px;color:#877276;text-align:center;">
                © ${new Date().getFullYear()} Flixo Streaming. All rights reserved.<br/>
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Your Flixo password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
  });
}
