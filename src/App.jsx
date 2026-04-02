import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import CustomerPortal from './pages/CustomerPortal'
import RetailerDashboard from './pages/RetailerDashboard'
import ShopPage from './pages/ShopPage'
import ShopsPage from './pages/ShopsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#F1F5F9',
              border: '1px solid #1E293B',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#111827' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#111827' } },
            duration: 3000,
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/shops" element={<ShopsPage />} />

          {/* QR scan destination - accessible without auth */}
          <Route path="/shop/:shopId" element={<ShopPage />} />

          {/* Customer protected */}
          <Route path="/customer" element={
            <ProtectedRoute role="customer"><CustomerPortal /></ProtectedRoute>
          } />

          {/* Retailer protected */}
          <Route path="/retailer" element={
            <ProtectedRoute role="retailer"><RetailerDashboard /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
