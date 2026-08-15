// src/App.jsx
import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import CartSidebar from './components/cart/CartSidebar'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './components/admin/ProtectedRoute'

function Layout({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main>{children}</main>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', fontWeight: 600, fontSize: '14px' },
          success: { style: { background: '#022659', color: '#fff' } },
          error: { style: { background: '#ef4444', color: '#fff' } },
        }}
      />

      <Routes>
        {/* Rutas públicas con navbar */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/producto/:id" element={<Layout><ProductPage /></Layout>} />

        {/* Rutas admin — sin navbar */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}
