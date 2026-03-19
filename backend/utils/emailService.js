// ─── utils/emailService.js ──────────────────────────────────────────────────
// Handles sending OTPs and PDF tickets via Nodemailer
// ──────────────────────────────────────────────────────────────────────────────

const nodemailer = require('nodemailer');

// ─── Configuration ─────────────────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Sanitize SMTP Password (remove spaces if any)
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const SMTP_USER = process.env.SMTP_USER;

// Standard Transporter for SMTP fallback
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 10000,
  tls: { rejectUnauthorized: false }
});

/**
 * Helper to send via Resend HTTP API (Bypasses SMTP port blocks)
 */
async function sendViaResend(to, subject, html, attachments = []) {
  console.log(`[RESEND] Attempting API send to ${to}...`);
  try {
    // IMPORTANT: If using Resend without a verified domain, 'from' MUST be 'onboarding@resend.dev'
    // We default to onboarding@resend.dev unless the user provides a custom RESEND_FROM variable.
    const fromAddress = process.env.RESEND_FROM || 'onboarding@resend.dev';
    
    const body = {
      from: `"The Music Society" <${fromAddress}>`,
      to: [to],
      subject,
      html,
    };

    if (attachments.length > 0) {
      body.attachments = attachments.map(a => ({
        filename: a.filename,
        content: a.content.toString('base64'),
      }));
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[RESEND] API Success! ID: ${data.id}`);
      return true;
    } else {
      console.error('[RESEND] API Error:', data);
      return false;
    }
  } catch (err) {
    console.error('[RESEND] Fetch Error:', err.message);
    return false;
  }
}

/**
 * Send OTP for verification or password reset
 */
async function sendOTP(email, otp, name) {
  const subject = 'Verification Code - The Music Society';
  const html = `<div style="font-family: sans-serif; padding: 20px; color: #111;">
            <h2>The Music Society</h2>
            <p>Hello <b>${name}</b>,</p>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 5px; color: #000;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
          </div>`;

  // Priority 1: Resend API
  if (RESEND_API_KEY) {
    return await sendViaResend(email, subject, html);
  }

  // Priority 2: Simulation Mode
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL SIMULATION] To: ${email} | OTP: ${otp}`);
    return true;
  }

  // Priority 3: SMTP (Legacy/Local)
  try {
    const info = await transporter.sendMail({
      from: `"The Music Society" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html
    });
    console.log(`[SMTP] Sent! MsgID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[SMTP] Error: ${err.message}`);
    return false;
  }
}

/**
 * Send PDF ticket after verification
 */
async function sendTicket(email, pdfBuffer, name, eventName) {
  const subject = `Your Tickets - ${eventName}`;
  const html = `<p>Hello ${name},</p><p>Your tickets for <b>${eventName}</b> are confirmed! Please find them attached.</p>`;
  const filename = `${eventName.replace(/\s+/g, '_')}_Ticket.pdf`;

  // Priority 1: Resend API
  if (RESEND_API_KEY) {
    return await sendViaResend(email, subject, html, [{ filename, content: pdfBuffer }]);
  }

  // Priority 2: Simulation
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL SIMULATION] To: ${email} | PDF TICKET SENT`);
    return true;
  }

  // Priority 3: SMTP
  try {
    await transporter.sendMail({
      from: `"The Music Society" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
      attachments: [{ filename, content: pdfBuffer }]
    });
    return true;
  } catch (err) {
    console.error(`[SMTP] Ticket Error: ${err.message}`);
    return false;
  }
}

module.exports = { sendOTP, sendTicket };
