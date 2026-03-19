// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Main router configuration using React Router v6
// ──────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EventPage from './pages/EventPage';
import PaymentPage from './pages/PaymentPage';
import StatusPage from './pages/StatusPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import UserBookings from './pages/UserBookings';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayments from './pages/admin/AdminPayments';
import AdminBookings from './pages/admin/AdminBookings';
import AdminEvent from './pages/admin/AdminEvent';
import AdminScanner from './pages/admin/AdminScanner';
import AdminUsers from './pages/admin/AdminUsers';

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
      <Routes>
        {/* ── User Flow ──────────────────────────────────────────────────── */}
        <Route path="/" element={<EventPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route path="/pay" element={<RequireUserAuth><PaymentPage /></RequireUserAuth>} />
        <Route path="/history" element={<RequireUserAuth><UserBookings /></RequireUserAuth>} />
        <Route path="/status/:bookingId" element={<StatusPage />} />

        {/* ── Admin Panel ────────────────────────────────────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="event" element={<AdminEvent />} />
          <Route path="scanner" element={<AdminScanner />} />
        </Route>

        {/* ── Fallback ───────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
