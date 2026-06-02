import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';

// Import your other pages/components
// import DashboardPage from '@/pages/DashboardPage';
// import HomePage from '@/pages/HomePage';

/**
 * Example routing configuration with authentication
 * Replace the placeholder components with your actual pages
 */
export function AppRouting() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - redirect to dashboard if already authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Protected routes - redirect to login if not authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {/* <DashboardPage /> */}
              <div>Dashboard (Replace with your dashboard component)</div>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouting;
