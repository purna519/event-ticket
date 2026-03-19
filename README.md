# Event Ticketing System

A full-stack web-based event ticketing system with UPI payment deep links, UTR (transaction ID) verification, QR ticket generation, and a JWT-secured admin panel.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT (bcryptjs) |
| QR Code | `qrcode` |
| PDF Ticket | `pdfkit` |
| CSV Upload | `multer` + `csv-parser` |

---

## 📁 Project Structure

```
event-ticketing/
├── backend/
│   ├── models/         # Mongoose models (Admin, Event, Payment, Booking)
│   ├── routes/         # Express routes (auth, events, bookings, admin)
│   ├── middleware/     # JWT auth middleware
│   ├── utils/          # QR + PDF ticket generator
│   ├── .env.example    # Environment template
│   └── server.js       # App entry point
└── frontend/
    ├── src/
    │   ├── api/        # Axios client
    │   ├── components/ # Shared components (StepIndicator)
    │   └── pages/      # User pages + admin panel
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally OR a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd event-ticketing/backend

# Copy environment file and configure it
copy .env.example .env
# (then edit .env with your UPI ID, MongoDB URI, etc.)

# Install dependencies
npm install

# Start server
npm start
# or for development with auto-reload:
npm run dev
```

The backend will start on **http://localhost:5000**

On first start, it auto-seeds:
- A default admin: `admin / admin123` (configurable in `.env`)
- A sample event with the values from `.env`

---

### 2. Frontend Setup

```bash
cd event-ticketing/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will start on **http://localhost:5173**

> No separate `.env` needed — Vite proxies `/api` requests to `localhost:5000`

---

## 🔑 Admin Panel

1. Visit `http://localhost:5173/admin/login`
2. Login with `admin / admin123` (or your configured credentials)

### Admin features:
| Page | What you can do |
|---|---|
| **Dashboard** | View stats: total bookings, verified, pending, payment records |
| **Payments** | Upload CSV of real UTR records, or add manually |
| **Bookings** | View all submissions, approve/reject manually, download PDF tickets |
| **Event Settings** | Edit event name, date, price, UPI ID, etc. |

---

## 📋 CSV Format for Payment Upload

```csv
UTR,Amount,Date
306120563434,499,2026-04-01
405231674545,499,2026-04-02
```

Column names are **case-insensitive**. Date is optional.

---

## 🔄 User Flow

```
/ (Event Page) → /pay (UPI Payment) → /submit (Enter UTR) → /status/:id (Ticket)
```

1. User views event details and clicks **Book Now**
2. User pays via UPI deep link (PhonePe/GPay/Paytm)
3. User returns and submits their Name, Contact, and UTR
4. System checks UTR against payments collection:
   - **Found + unused + correct amount** → Ticket generated instantly ✅
   - **Not found** → Status: Pending ⏳ (auto-refreshes every 10s)
   - **Already used** → Rejected ❌
   - **Amount mismatch** → Rejected ❌
5. On verification → User can view ticket with QR and download PDF

---

## 🌐 API Endpoints

### Public
| Method | URL | Description |
|---|---|---|
| GET | `/api/events/current` | Get event details |
| POST | `/api/bookings/submit` | Submit UTR for verification |
| GET | `/api/bookings/status/:id` | Poll booking status |
| GET | `/api/bookings/ticket/:id` | Download PDF ticket |
| GET | `/api/bookings/qr/:id` | Get QR code image |

### Admin (requires `Authorization: Bearer <token>`)
| Method | URL | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/payments` | List payment records |
| POST | `/api/admin/payments/upload` | Upload CSV |
| POST | `/api/admin/payments/manual` | Add single payment |
| GET | `/api/admin/bookings` | List all bookings |
| PATCH | `/api/admin/bookings/:id/approve` | Approve booking |
| PATCH | `/api/admin/bookings/:id/reject` | Reject booking |
| PUT | `/api/admin/event` | Update event details |

---

## ✅ Validation Rules

- UTR format: alphanumeric, 10-22 characters
- One UTR can only be used **once** (unique index + used flag)
- Duplicate booking submissions blocked (UTR index on Booking model)
- Amount must match ticket price exactly
- JWT expires in 24 hours

---

## 🛡️ Security Notes

- Admin password is hashed with bcrypt (10 rounds)
- JWT secret should be changed from the default in production
- CSV upload is limited to 5 MB and `.csv` files only
- No payment gateway involved — purely UTR matching

---

## 🎨 UI Screenshots

| Page | Description |
|---|---|
| Event Page | Dark glassmorphism event card with Book Now CTA |
| Payment Page | UPI deep link buttons for PhonePe, GPay, Paytm |
| Submit Page | UTR submission form with validation |
| Status Page | Verified state shows QR + PDF download |
| Admin Dashboard | Stat cards + quick navigation |
| Admin Payments | CSV upload + manual entry + searchable table |
| Admin Bookings | Filter + approve/reject table |
