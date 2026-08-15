// src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import useCartStore from '../../store/cartStore'
import { configApi } from '../../lib/api'

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Smartphones', to: '/?categoria=smartphones' },
  { label: 'Portátiles', to: '/?categoria=portatiles' },
  { label: 'Accesorios', to: '/?categoria=accesorios' },
  { label: 'Accesorios Gamer', to: '/?categoria=accesorios-gamer' },
  { label: 'Herramientas', to: '/?categoria=herramientas' },
]

export default function Navbar({ onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => configApi.get(),
    select: (r) => r.data,
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/?buscar=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-[#011a3d] text-slate-400 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex gap-8">
            <span>Servicio técnico especializado en equipos electrónicos</span>
          </div>
          <div className="flex gap-8 items-center">
            {config?.store_phone && (
              <a
                href={`tel:${config.store_phone.replace(/\s/g, '')}`}
                className="hover:text-white transition-colors font-medium tracking-wide"
              >
                {config.store_phone}
              </a>
            )}
            <span className="text-slate-600">|</span>
            <span>{config?.store_hours?.split('·')[0]?.trim() || 'Lun–Vie 9AM–8PM'}</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'shadow-[0_1px_0_0_rgba(0,0,0,0.08)] backdrop-blur-sm' : 'border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-[60px] gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <img src="/logo-icon.png" alt="Movilcenter Plus" className="w-10 h-10 rounded-2xl object-cover" />
              <div className="hidden sm:block">
                <span className="font-black text-[#022659] text-base tracking-tight leading-none">MOVILCENTER</span>
                <span className="font-black text-[#005fbf] text-base tracking-tight leading-none"> PLUS</span>
              </div>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 rounded-lg transition-all duration-150 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-4 right-4 h-px bg-[#005fbf] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                aria-label="Buscar"
              >
                <Search size={18} strokeWidth={2} />
              </button>

              <button
                onClick={onCartOpen}
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all relative"
                aria-label="Carrito"
              >
                <ShoppingCart size={18} strokeWidth={2} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-[#005fbf] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all lg:hidden"
                aria-label="Menú"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={menuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-slate-100 bg-white"
            >
              <div className="px-4 py-3 flex flex-col gap-0.5">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#005fbf] hover:bg-[#f0f9ff] rounded-xl transition-all"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              onSubmit={handleSearch}
              className="bg-white rounded-2xl shadow-2xl shadow-black/20 w-full max-w-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 items-center px-4 py-2">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar smartphones, repuestos, herramientas..."
                  className="flex-1 outline-none text-base text-slate-800 placeholder:text-slate-400 py-2"
                />
                <button
                  type="submit"
                  className="bg-[#005fbf] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#022659] transition-colors shrink-0"
                >
                  Buscar
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
