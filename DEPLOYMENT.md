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

### A. Backend (Railway)
1. In Railway, click **New Project** -> **Deploy from GitHub repo**.
2. Select your repository.
3. **Optimizing Build Triggers**:
   - Go to **Settings** -> **Build** -> **Watch Patterns**.
   - Enter `backend/**`. This ensures Railway ONLY redeploys when backend files change.
4. (Optional) In the service settings, you can set the **Root Directory** to `backend`.
5. Add the following **Environment Variables**:
   *   `MONGODB_URI`: Your MongoDB connection string (from Atlas or Railway).
   *   `JWT_SECRET`: A secure random string for admin login.
   *   `USER_JWT_SECRET`: A secure random string for user login.
   *   `FRONTEND_URL`: Your Vercel URL (e.g., `https://bhajan-frontend.vercel.app`).
   *   `SMTP_HOST`: `smtp.gmail.com`
   *   `SMTP_PORT`: `465`
   *   `SMTP_SECURE`: `true`
   *   `SMTP_USER`: Your Gmail address.
   *   `SMTP_PASS`: Your Gmail **App Password** (not your regular password).
   *   `EVENT_NAME`, `TICKET_PRICE`, `UPI_ID`: (Optional, will use defaults if not set).

### B. Frontend (Vercel)
1. In Vercel, click **Add New** -> **Project**.
2. Import your GitHub repository.
3. **Optimizing Build Triggers**:
   - In **Project Settings**, go to **Git** -> **Ignored Build Step**.
   - Set it to: `git diff --quiet HEAD^ HEAD ./frontend`. This ensures Vercel ONLY builds when frontend files change.
4. Set the **Root Directory** to `frontend`.
5. The **Framework Preset** should be auto-detected as **Vite**.
6. Add the following **Environment Variable**:
   - `VITE_API_BASE_URL`: Your Railway backend URL (e.g., `https://your-backend-url.up.railway.app/api`).
7. Click **Deploy**.

## 6. Admin First Steps
1. Login at `/admin/login` using the credentials in your `.env`.
2. Go to **Event Settings** to set your UPI details, Venue, and Sponsors.
3. Test the flow by making a small transaction and verifying the UTR in the **Admin Dashboard**.

---
*For support regarding payment issues or ticket delivery, contact: 7093237728*
