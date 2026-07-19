import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function send(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
  } catch (err) {
    // Email failures should never block the customer's action (e.g. registration).
    // eslint-disable-next-line no-console
    console.error(`Email send failed to ${to}:`, err);
  }
}

const wrap = (title: string, body: string) => `
  <div style="font-family: Georgia, serif; background:#F7F5F0; padding:32px;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-top:4px solid #0B3D2E;padding:32px;">
      <h1 style="color:#0B3D2E;font-size:22px;letter-spacing:1px;">ARYORA</h1>
      <p style="color:#8a7245;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Light. Legacy. You.</p>
      <h2 style="font-size:18px;color:#111;">${title}</h2>
      <div style="color:#333;font-size:14px;line-height:1.6;">${body}</div>
      <p style="margin-top:32px;font-size:12px;color:#999;">Aryora · Gomti Nagar, Lucknow, UP · +91 8808828646</p>
    </div>
  </div>`;

export function sendOtpEmail(to: string, otp: string) {
  return send(
    to,
    "Verify your Aryora account",
    wrap("Your verification code", `<p>Use this code to verify your account:</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:bold;color:#0B3D2E;">${otp}</p>
      <p>This code expires in 10 minutes.</p>`)
  );
}

export function sendWelcomeEmail(to: string, name: string) {
  return send(
    to,
    "Welcome to Aryora",
    wrap("Welcome, " + name, `<p>Your account is verified. Explore lab-grown diamond, gold, and 92.5 silver jewellery crafted with intention.</p>`)
  );
}

export function sendOrderConfirmationEmail(to: string, orderNumber: string, total: string) {
  return send(
    to,
    `Order confirmed — ${orderNumber}`,
    wrap(
      "Thank you for your order",
      `<p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
       <p>Order total: <strong>${total}</strong></p>
       <p>We'll notify you as soon as it ships.</p>`
    )
  );
}
