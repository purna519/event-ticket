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
      margin: 0, // Manual margins for better control
      info: {
        Title: `Official Entry Pass - ${event.name}`,
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

    // ── COLORS ───────────────────────────────────────────────────────────────
    const GOLD = '#c9a84c';
    const BLACK = '#070503';
    const WHITE = '#ffffff';
    const GRAY = '#7a6e5c';

    // ── LAYOUT CONSTANTS ─────────────────────────────────────────────────────
    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // ── MAIN BACKGROUND (PREMIUM ARTWORK WATERMARK) ──────────────────────────
    const bgImagePath = path.join(__dirname, '../../frontend/public/hero_gold_guitar.jpg');
    if (fs.existsSync(bgImagePath)) {
        // Draw the uploaded golden artwork as the full-scale background
        doc.image(bgImagePath, 0, 0, { width: pageWidth, height: pageHeight });
        // Add a strong dark translucent overlay so text remains perfectly readable
        doc.rect(0, 0, pageWidth, pageHeight).fillColor(BLACK).fillOpacity(0.85).fill();
        doc.fillOpacity(1); // Reset opacity for subsequent drawing
    } else {
        doc.rect(0, 0, pageWidth, pageHeight).fill(BLACK);
    }
    
    // ── OUTER GOLD BORDER (ROYAL) ───────────────────────────────────────────
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(2).strokeColor(GOLD).stroke();
    doc.rect(28, 28, pageWidth - 56, pageHeight - 56).lineWidth(0.5).strokeColor(GOLD).stroke();
    
    // Decorative Corners (L-shapes)
    const cornerSize = 40;
    const drawCorner = (x, y, xDir, yDir) => {
        doc.moveTo(x, y).lineTo(x + xDir * cornerSize, y).lineWidth(4).strokeColor(GOLD).stroke();
        doc.moveTo(x, y).lineTo(x, y + yDir * cornerSize).lineWidth(4).strokeColor(GOLD).stroke();
    };
    drawCorner(20, 20, 1, 1);
    drawCorner(pageWidth - 20, 20, -1, 1);
    drawCorner(20, pageHeight - 20, 1, -1);
    drawCorner(pageWidth - 20, pageHeight - 20, -1, -1);

    // ── VINYL RECORD WATERMARK (CENTERED & ARTISTIC) ─────────────────────────
    doc.save();
    doc.translate(pageWidth / 2, pageHeight / 2);
    for (let i = 0; i < 25; i++) {
        doc.circle(0, 0, 100 + i * 15).lineWidth(0.2).strokeColor(GOLD + '08').stroke();
    }
    doc.circle(0, 0, 120).lineWidth(0.5).strokeColor(GOLD + '15').stroke();
    doc.restore();

    // ── TOP BRANDING ────────────────────────────────────────────────────────
    doc.fillColor(GOLD).fontSize(9).font('Helvetica-Bold')
      .text('THE MUSIC SOCIETY OFFICIAL PRODUCTION', 0, 70, { align: 'center', width: pageWidth, tracking: 10 });

    // ── ORNAMENTAL LINE ─────────────────────────────────────────────────────
    doc.moveTo(pageWidth/2 - 50, 95).lineTo(pageWidth/2 + 50, 95).lineWidth(1).strokeColor(GOLD).stroke();

    // ── MAIN HEADER (HOLLOW GOLD BRACKET) ────────────────────────────────────
    doc.rect(40, 130, pageWidth - 80, 100)
       .fillColor(BLACK).fillOpacity(0.5).fill()
       .lineWidth(1).strokeColor(GOLD).strokeOpacity(1).stroke();
    doc.fillOpacity(1);
    
    doc.fillColor(GOLD).fontSize(34).font('Helvetica-Bold')
      .text(event.name.toUpperCase(), 40, 155, { tracking: 2, width: pageWidth - 80, align: 'center', lineGap: 5 });
    
    doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold')
      .text(`EP. ${String(event.episodeNum || 3).padStart(2,'0')} • OFFICIAL TFI EVENT • EXCLUSIVE ACCESS`, 0, 205, { align: 'center', width: pageWidth, tracking: 5 });

    // ── SUB-HEADER ──────────────────────────────────────────────────────────
    doc.fillColor(WHITE).fontSize(14).font('Helvetica-Bold')
      .text('IDENTITY SIGNATURE & ENTRY PASS', 0, 280, { align: 'center', width: pageWidth, tracking: 8 });

    // ── EVENT DETAILS (VERTICAL FLOW) ───────────────────────────────────────
    const sectionX = 80;
    let currentY = 350;

    const addPremiumSection = (label, value, isHighlighted = false) => {
        doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold').text(label.toUpperCase(), sectionX, currentY, { tracking: 5 });
        doc.fillColor(isHighlighted ? GOLD : WHITE).fontSize(20).font('Helvetica-Bold').text(value, sectionX, currentY + 18);
        
        // Dynamic decorative dot
        doc.circle(sectionX - 20, currentY + 28, 2).fill(GOLD);
        
        currentY += 75;
    };

    addPremiumSection('Venue Location', event.venue || 'Reserved Society Venue');
    addPremiumSection('Scheduled Date', new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    addPremiumSection('Admission Start', event.time || 'Entry at 6:30 PM');
    addPremiumSection('Record ID (UTR)', booking.utr || 'INTERNAL_ADMIN_ISSUE', true);

    // ── ACCESS TIER (FIXED POSITION AT BOTTOM) ─────────────────────────────
    const bottomZoneY = pageHeight - 320;
    doc.rect(80, bottomZoneY, pageWidth - 160, 45).fill(GOLD + '15').strokeColor(GOLD).lineWidth(1).stroke();
    doc.fillColor(WHITE).fontSize(14).font('Helvetica-Bold')
      .text(`ACCESS GRANTED FOR ${booking.quantity} ${booking.quantity > 1 ? 'MEMBERS' : 'MEMBER'}`, 80, bottomZoneY + 16, { align: 'center', width: pageWidth - 160, tracking: 4 });

    // ── QR CODE ZONE ─────────────────────────────────────────────────────────
    const qrSize = 120;
    const qrDataUri = qrMap[tickets[0].ticketId];
    const qrX = (pageWidth / 2) - (qrSize / 2);
    const qrY = bottomZoneY + 70;

    if (qrDataUri) {
        // High-contrast frame for QR
        doc.rect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24).fill(WHITE);
        doc.rect(qrX - 9, qrY - 9, qrSize + 18, qrSize + 18).lineWidth(1).strokeColor(GOLD).stroke();
        
        const base64Data = qrDataUri.replace(/^data:image\/png;base64,/, '');
        doc.image(Buffer.from(base64Data, 'base64'), qrX, qrY, { width: qrSize });
    }

    // ── UNIQUE IDENTIFIER ───────────────────────────────────────────────────
    doc.fillColor(GOLD).fontSize(10).font('Helvetica-Bold')
      .text(tickets[0].ticketId.toUpperCase(), 0, qrY + qrSize + 22, { align: 'center', width: pageWidth, tracking: 8 });

    // ── FOOTER ──────────────────────────────────────────────────────────────
    doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold')
      .text('MANDATORY PRODUCTION GUIDELINES', 0, pageHeight - 75, { align: 'center', width: pageWidth, tracking: 2 });
    
    doc.fillColor(GOLD).fontSize(9).font('Helvetica-Bold')
      .text('STRICTLY NON-TRANSFERABLE • PRODUCTION HUB ACCESS ONLY', 0, pageHeight - 60, { align: 'center', width: pageWidth, tracking: 2 });

    doc.end();
  });
}

module.exports = { generateQR, generatePDF };
