// ─── utils/emailService.js ──────────────────────────────────────────────────
// Handles sending OTPs and PDF tickets via Nodemailer
// ──────────────────────────────────────────────────────────────────────────────

const nodemailer = require('nodemailer');

// ─── Configuration ─────────────────────────────────────────────────────────────
const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim();
const BREVO_API_KEY = (process.env.BREVO_API_KEY || '').trim();

// Sanitize SMTP Password (remove spaces if any)
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const SMTP_USER = process.env.SMTP_USER;

// Priority logic for 'from' address
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER || 'onboarding@resend.dev';

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
 * Helper to send via Brevo (formerly Sendinblue) HTTP API
 * Best for users without a custom domain.
 */
async function sendViaBrevo(to, subject, html, attachments = []) {
  console.log(`[BREVO] Attempting API send to ${to}...`);
  try {
    const payload = {
      sender: { name: "The Music Society", email: EMAIL_FROM },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    };

    if (attachments.length > 0) {
      payload.attachment = attachments.map(a => ({
        name: a.filename,
        content: a.content.toString('base64'),
      }));
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[BREVO] API Success! ID: ${data.messageId}`);
      return true;
    } else {
      console.error('[BREVO] API Error:', data);
      return data;
    }
  } catch (err) {
    console.error('[BREVO] Fetch Error:', err.message);
    return { error: err.message };
  }
}

/**
 * Helper to send via Resend HTTP API (Bypasses SMTP port blocks)
 */
async function sendViaResend(to, subject, html, attachments = []) {
  console.log(`[RESEND] Attempting API send to ${to}...`);
  try {
    // IMPORTANT: If using Resend without a verified domain, 'fromAddress' MUST be 'onboarding@resend.dev'
    const fromAddress = process.env.RESEND_FROM || (RESEND_API_KEY ? 'onboarding@resend.dev' : EMAIL_FROM);
    
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
      return data; // Return full error object
    }
  } catch (err) {
    console.error('[RESEND] Fetch Error:', err.message);
    return { error: err.message };
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

  // Priority 1: Brevo API (Lensient for no domain)
  if (BREVO_API_KEY) {
    return await sendViaBrevo(email, subject, html);
  }

  // Priority 2: Resend API
  if (RESEND_API_KEY) {
    return await sendViaResend(email, subject, html);
  }

  // Priority 3: Simulation Mode
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL SIMULATION] To: ${email} | OTP: ${otp}`);
    return true;
  }

  // Priority 4: SMTP (Legacy/Local)
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

  // Priority 1: Brevo
  if (BREVO_API_KEY) {
    return await sendViaBrevo(email, subject, html, [{ filename, content: pdfBuffer }]);
  }

  // Priority 2: Resend API
  if (RESEND_API_KEY) {
    return await sendViaResend(email, subject, html, [{ filename, content: pdfBuffer }]);
  }

  // Priority 3: Simulation
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL SIMULATION] To: ${email} | PDF TICKET SENT`);
    return true;
  }

  // Priority 4: SMTP
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
