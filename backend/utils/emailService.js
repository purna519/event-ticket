// ─── utils/emailService.js ──────────────────────────────────────────────────
// Handles sending OTPs and PDF tickets via Nodemailer
// ──────────────────────────────────────────────────────────────────────────────

const nodemailer = require('nodemailer');

// Configure transporter (Default to console log for testing if no env provided)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 5,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP for verification or password reset
 */
async function sendOTP(email, otp, name) {
  const mailOptions = {
    from: `"The Music Society" <${process.env.SMTP_USER || 'noreply@musicsociety.com'}>`,
    to: email,
    subject: 'Verification Code - The Music Society',
    text: `Hello ${name},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `<div style="font-family: sans-serif; padding: 20px; color: #111;">
            <h2>The Music Society</h2>
            <p>Hello <b>${name}</b>,</p>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 5px; color: #000;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
          </div>`,
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('----------------------------------------');
    console.log(`[EMAIL SIMULATION] To: ${email} | OTP: ${otp}`);
    console.log('----------------------------------------');
    return true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email, '| MsgID:', info.messageId);
    return true;
  } catch (err) {
    console.error('❌ EMAIL SENDING FAILED:', {
      to: email,
      error: err.message,
      code: err.code,
      response: err.response
    });
    return false;
  }
}

/**
 * Send PDF ticket after verification
 */
async function sendTicket(email, pdfBuffer, name, eventName) {
  const mailOptions = {
    from: `"The Music Society" <${process.env.SMTP_USER || 'noreply@musicsociety.com'}>`,
    to: email,
    subject: `Your Tickets - ${eventName}`,
    text: `Hello ${name},\n\nYour tickets for ${eventName} are confirmed! Please find them attached.`,
    attachments: [
      {
        filename: `${eventName.replace(/\s+/g, '_')}_Ticket.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('----------------------------------------');
    console.log(`[EMAIL SIMULATION] To: ${email} | PDF TICKET SENT`);
    console.log('----------------------------------------');
    return true;
  }

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Ticket email failed:', err);
    return false;
  }
}

module.exports = { sendOTP, sendTicket };
