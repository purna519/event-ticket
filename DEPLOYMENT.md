# Deployment Guide: Bhajan Event Ticketing System

Follow these steps to deploy the "Bhajan" Event Ticketing System for **The Music Society**.

## 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local or MongoDB Atlas)
- **NPM** or **Yarn**

## 2. Environment Configuration
Create a `.env` file in the `/backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bhajan
JWT_SECRET=admin_secret_key_here
USER_JWT_SECRET=member_secret_key_here

# Email Service (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

EVENT_NAME=Bhajan
TICKET_PRICE=499
UPI_ID=yourname@upi
UPI_NAME=The Music Society
```

> [!TIP]
> Use a Gmail App Password if you are using a Gmail account for `SMTP_PASS`. This is required for secure delivery of OTPs and tickets.

## 3. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm start` (or `npm run dev` for development)

## 4. Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Update API URL in `src/api/index.js` if necessary (default is `/api`).
4. Build for production: `npm run build`
5. To run in development: `npm run dev`

## 5. Deployment Options
### A. Local Machine / VPS
- Use **PM2** to keep the backend running: `pm2 start server.js --name "bhajan-api"`
- Serve the `frontend/dist` folder using **Nginx** or **Apache**.

### B. Cloud (Vercel/Render)
- **Backend**: Deploy the `/backend` folder to Render.com as a "Web Service".
- **Frontend**: Deploy the `/frontend` folder to Vercel/Netlify. Connect it to the backend URL via environment variables.

## 6. Admin First Steps
1. Login at `/admin/login` using the credentials in your `.env`.
2. Go to **Event Settings** to set your UPI details, Venue, and Sponsors.
3. Test the flow by making a small transaction and verifying the UTR in the **Admin Dashboard**.

---
*For support regarding payment issues or ticket delivery, contact: 7093237728*
