// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Main router configuration using React Router v6
// ──────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cursor from './components/Cursor';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import PaymentPage from './pages/PaymentPage';
import StatusPage from './pages/StatusPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import SubmitPage from './pages/SubmitPage';
import UserBookings from './pages/UserBookings';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GalleryPage from './pages/GalleryPage';
import ReviewsPage from './pages/ReviewsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayments from './pages/admin/AdminPayments';
import AdminBookings from './pages/admin/AdminBookings';
import AdminEvent from './pages/admin/AdminEvent';
import AdminScanner from './pages/admin/AdminScanner';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminBoxOffice from './pages/admin/AdminBoxOffice';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';

// Guard for admin routes
function RequireAuth({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" replace />;
}

// Guard for user routes
function RequireUserAuth({ children }) {
  const token = localStorage.getItem('userToken');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Cursor />
      <Routes>
        {/* ── User Flow ──────────────────────────────────────────────────── */}
        <Route element={<MainLayout><HomePage /></MainLayout>} path="/" />
        <Route element={<MainLayout><EventPage /></MainLayout>} path="/events" />
        <Route element={<MainLayout><EventPage /></MainLayout>} path="/events/:id" />
        <Route element={<MainLayout><GalleryPage /></MainLayout>} path="/gallery" />
        <Route element={<MainLayout><ReviewsPage /></MainLayout>} path="/reviews" />
        <Route element={<MainLayout><AboutPage /></MainLayout>} path="/about" />
        <Route element={<MainLayout><ContactPage /></MainLayout>} path="/contact" />
        <Route element={<MainLayout><RequireUserAuth><ProfilePage /></RequireUserAuth></MainLayout>} path="/profile" />
        
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<MainLayout><VerifyPage /></MainLayout>} path="/verify" />
        <Route element={<MainLayout><ResetPasswordPage /></MainLayout>} path="/reset-password" />
        
        <Route element={<MainLayout><RequireUserAuth><PaymentPage /></RequireUserAuth></MainLayout>} path="/pay/:eventId" />
        <Route element={<MainLayout><RequireUserAuth><PaymentPage /></RequireUserAuth></MainLayout>} path="/pay" />
        <Route element={<MainLayout><RequireUserAuth><SubmitPage /></RequireUserAuth></MainLayout>} path="/submit" />
        <Route element={<MainLayout><RequireUserAuth><UserBookings /></RequireUserAuth></MainLayout>} path="/history" />
        <Route element={<MainLayout><StatusPage /></MainLayout>} path="/status/:bookingId" />

        {/* ── Admin Panel ────────────────────────────────────────────────── */}
        <Route element={<AdminLogin />} path="/admin/login" />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
          path="/admin"
        >
          <Route element={<AdminDashboard />} index />
          <Route element={<AdminDashboard />} path="dashboard" />
          <Route element={<AdminPayments />} path="payments" />
          <Route element={<AdminBookings />} path="bookings" />
          <Route element={<AdminUsers />} path="users" />
          <Route element={<AdminEvent />} path="event" />
          <Route element={<AdminScanner />} path="scanner" />
          <Route element={<AdminAnalytics />} path="analytics" />
          <Route element={<AdminPromoCodes />} path="promos" />
          <Route element={<AdminBoxOffice />} path="box-office" />
          <Route element={<AdminEvents />} path="studio" />
        </Route>

        {/* ── Fallback ───────────────────────────────────────────────────── */}
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
