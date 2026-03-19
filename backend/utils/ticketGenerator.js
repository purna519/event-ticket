// ─── utils/ticketGenerator.js ─────────────────────────────────────────────────
// Utilities for generating:
//   1. QR code as base64 PNG string
//   2. PDF ticket (multi-page support) as a Buffer using pdfkit
// ──────────────────────────────────────────────────────────────────────────────

const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a QR code as a base64 data URI (PNG)
 */
async function generateQR(data) {
  return QRCode.toDataURL(data, {
    width: 250,
    margin: 2,
    color: { dark: '#111827', light: '#ffffff' },
  });
}

/**
 * Generate a PDF ticket buffer (one page per ticket)
 */
async function generatePDF(booking, event, qrMap) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 30,
      info: {
        Title: `Tickets - ${event.name}`,
        Author: 'The Music Society',
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const tickets = booking.tickets && booking.tickets.length > 0
      ? booking.tickets
      : [{ ticketId: booking.ticketId }];

    // Load poster image buffer if exists
    let posterBuffer = null;
    const posterPath = path.join(__dirname, '..', 'assets', 'poster.png');
    if (fs.existsSync(posterPath)) {
      posterBuffer = fs.readFileSync(posterPath);
    }

    // Layout Constants (A4: 595.28 x 841.89)
    const cardW = 250;
    const cardH = 380;

    // Render only the primary ticket (Entry Pass)
    const t = tickets[0];
    const marginX = 175; // Centered on A4 (595/2 - 250/2)
    const marginY = 50;
    const x = marginX;
    const y = marginY;

    // ── Card Border ──────────────────────────────────────────────────────────
    doc.rect(x, y, cardW, cardH).lineWidth(0.5).strokeColor('#e5e7eb').stroke();
    
    // ── Header (Black) ───────────────────────────────────────────────────────
    doc.rect(x, y, cardW, 60).fill('#000000');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
      .text(event.name.toUpperCase(), x + 15, y + 15, { width: cardW - 30, tracking: 1 });
    doc.fontSize(6).fillColor('#9ca3af')
      .text('THE MUSIC SOCIETY PRESENTS', x + 15, y + 45);

    // ── Event Visual (Poster) ────────────────────────────────────────────────
    if (posterBuffer) {
      doc.image(posterBuffer, x + 15, y + 75, { width: 70, height: 90 });
    } else {
      doc.rect(x + 15, y + 75, 70, 90).fill('#f3f4f6');
      doc.fillColor('#9ca3af').fontSize(8).text('BHAJAN', x + 25, y + 115);
    }

    // ── Details ──────────────────────────────────────────────────────────────
    const detX = x + 100;
    const addRow = (label, value, ry, link) => {
      doc.fillColor('#9ca3af').fontSize(5).font('Helvetica-Bold').text(label.toUpperCase(), detX, y + ry);
      const options = { width: cardW - 110 };
      if (link) options.link = link;
      doc.fillColor(link ? '#3b82f6' : '#000000').fontSize(7).font('Helvetica-Bold').text(value, detX, y + ry + 8, options);
    };

    addRow('Location', event.venue, 75, event.locationUrl);
    addRow('Date', event.date, 100);
    addRow('Time', event.time, 125);
    addRow('UTR (REF)', booking.utr || 'INTERNAL_GEN', 150);

    // ── Separator (Dashed) ───────────────────────────────────────────────────
    const sepY = y + 180;
    doc.moveTo(x + 15, sepY).lineTo(x + cardW - 15, sepY)
      .dash(2, { space: 2 }).strokeColor('#d1d5db').lineWidth(0.5).stroke().undash();

    // ── Guest & Quantity (PROMINEANT) ─────────────────────────────────────────
    doc.fillColor('#000000').fontSize(12).font('Helvetica-Bold')
      .text(`ENTRY PASS FOR ${booking.quantity} ${booking.quantity > 1 ? 'PEOPLE' : 'PERSON'}`, x + 15, y + 195, { width: cardW - 30, align: 'center' });
    
    doc.fillColor('#9ca3af').fontSize(6).text('HOLDER: ', x + 15, y + 215, { continued: true })
      .fillColor('#000000').font('Helvetica-Bold').text(`${booking.name.toUpperCase()}`);

    // ── QR Code Section ──────────────────────────────────────────────────────
    const qrY = y + 230;
    const qrWidth = 80;
    const qrDataUri = qrMap[t.ticketId];
    if (qrDataUri) {
      const base64Data = qrDataUri.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');
      doc.image(qrBuffer, x + (cardW / 2) - (qrWidth / 2), qrY, { width: qrWidth });
    }

    // ── Ticket ID & Counter ──────────────────────────────────────────────────
    doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
      .text(t.ticketId, x, qrY + qrWidth + 5, { align: 'center', width: cardW });
    
    doc.fillColor('#9ca3af').fontSize(5)
      .text(`BHANJAN EXPERIENCE PASS · 2026`, x, qrY + qrWidth + 15, { align: 'center', width: cardW });

    // ── Sponsors Layer ───────────────────────────────────────────────────────
    if (event.sponsors && event.sponsors.length > 0) {
      const spX = x + 15;
      const spY = y + cardH - 60;
      doc.fillColor('#9ca3af').fontSize(4).font('Helvetica-Bold').text('PROUDLY SUPPORTED BY', spX, spY - 8);
      
      event.sponsors.slice(0, 4).forEach((sp, sidx) => {
        const logoPath = path.join(__dirname, '..', sp.logoUrl);
        const logoX = spX + sidx * 55;
        
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(fs.readFileSync(logoPath), logoX, spY, { fit: [45, 30] });
          } catch (e) {
            doc.fillColor('#6b7280').fontSize(5).text(sp.name.toUpperCase(), logoX, spY + 10, { width: 50, truncate: true });
          }
        } else {
          doc.fillColor('#6b7280').fontSize(5).text(sp.name.toUpperCase(), logoX, spY + 10, { width: 50, truncate: true });
        }
      });
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.rect(x, y + cardH - 25, cardW, 25).fill('#f9fafb');
    doc.fillColor('#9ca3af').fontSize(5)
      .text(`AUTHENTIC ENTRY  ·  SUPPORT: ${event.supportNumber || '7093237728'}`, x, y + cardH - 15, { align: 'center', width: cardW });

    doc.end();
  });
}

module.exports = { generateQR, generatePDF };
