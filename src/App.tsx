import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { AuthProvider, useAuth } from './lib/auth-context'
import { ThemeProvider } from './lib/theme-context'
import AuthPage from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Franchises from './pages/Franchises'
import Brands from './pages/Brands'
import Locations from './pages/Locations'
import Finance from './pages/Finance'
import Settings from './pages/Settings'
import LeadStatusMaster from './pages/LeadStatusMaster'
import CustomerMaster from './pages/CustomerMaster'
import Layout from './components/layout/Layout'

function ProtectedRoute() {
  const { ready, user } = useAuth()
  if (!ready) return null
  return user ? <Layout /> : <Navigate to="/signin" replace />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
            <Routes>
            <Route path="/signin" element={<AuthPage mode="signin" />} />
            <Route path="/login" element={<AuthPage mode="signin" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="franchises" element={<Franchises />} />
              <Route path="brands" element={<Brands />} />
              <Route path="locations" element={<Locations />} />
              <Route path="finance" element={<Finance />} />
              <Route path="lead-status-master" element={<LeadStatusMaster />} />
              <Route path="customer-master" element={<CustomerMaster />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
