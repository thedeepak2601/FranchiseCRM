import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './lib/theme-context'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Franchises from './pages/Franchises'
import Brands from './pages/Brands'
import Locations from './pages/Locations'
import Finance from './pages/Finance'
import Settings from './pages/Settings'
import Layout from './components/layout/Layout'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="franchises" element={<Franchises />} />
            <Route path="brands" element={<Brands />} />
            <Route path="locations" element={<Locations />} />
            <Route path="finance" element={<Finance />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App