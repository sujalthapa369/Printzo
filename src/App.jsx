import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from 'next-themes'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import CustomerPortal from './pages/CustomerPortal'
import RetailerDashboard from './pages/RetailerDashboard'
import ShopPage from './pages/ShopPage'
import ShopsPage from './pages/ShopsPage'

// Wrapper for magical page fade-ins
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(5px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(2px)' }}
      transition={{ duration: 0.35, ease: 'linear' }}
      className="min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><PublicRoute><Auth /></PublicRoute></PageWrapper>} />
        <Route path="/shops" element={<PageWrapper><ShopsPage /></PageWrapper>} />
        <Route path="/shop/:shopId" element={<PageWrapper><ShopPage /></PageWrapper>} />
        <Route path="/customer" element={<ProtectedRoute role="customer"><PageWrapper><CustomerPortal /></PageWrapper></ProtectedRoute>} />
        <Route path="/retailer" element={<ProtectedRoute role="retailer"><PageWrapper><RetailerDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(var(--color-card) / 0.8)',
                backdropFilter: 'blur(12px)',
                color: 'rgba(var(--color-text-main) / 1)',
                border: '1px solid rgba(var(--color-border) / 0.5)',
                borderRadius: '16px',
                fontFamily: 'Syne, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10B981', secondary: 'transparent' } },
              error: { iconTheme: { primary: '#EF4444', secondary: 'transparent' } },
              duration: 3000,
            }}
          />
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
