import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import PremiumHeader from './components/layout/PremiumHeader'
import FloatingCart from './components/layout/FloatingCart'
import ToastContainer from './components/ui/ToastContainer'
import Home from './pages/public/Home'
import Catalog from './pages/public/Catalog'
import Privacidad from './pages/public/Privacidad'
import Terminos from './pages/public/Terminos'
import Profile from './pages/customer/Profile'
import Tracking from './pages/customer/Tracking'
import AdminPanel from './pages/admin/AdminPanel'
import LoginPage from './pages/auth/LoginPage'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/seguimiento" element={<Tracking />} />
        <Route path="/mcs-management" element={<AdminPanel />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Preparando tu experiencia...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ScrollToTop />

      <div className="flex flex-col min-h-screen">
        <PremiumHeader />
        <FloatingCart />
        <ToastContainer />

        <main className="flex-grow flex flex-col relative">
          <AnimatedRoutes />
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}