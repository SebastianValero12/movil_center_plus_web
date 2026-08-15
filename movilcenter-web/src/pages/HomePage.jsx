// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Shield, Zap, Wrench, Award, ChevronRight, Clock, MapPin, Phone, Search } from 'lucide-react'
import { productsApi, configApi } from '../lib/api'
import ProductCard from '../components/product/ProductCard'

const CATEGORIES = [
  { label: 'Todos', slug: '' },
  { label: 'Smartphones', slug: 'smartphones' },
  { label: 'Portátiles', slug: 'portatiles' },
  { label: 'Accesorios', slug: 'accesorios' },
  { label: 'Accesorios Gamer', slug: 'accesorios-gamer' },
  { label: 'Herramientas', slug: 'herramientas' },
]

// Animated counter
function Counter({ to, duration = 1.5 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, to, duration])
  return <span ref={ref}>{count.toLocaleString()}</span>
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="h-56 bg-slate-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-100 rounded-full w-1/3 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse" />
        <div className="h-8 bg-slate-100 rounded-xl w-full animate-pulse" />
      </div>
    </div>
  )
}

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const searchQuery = searchParams.get('buscar') || ''
  const categoryParam = searchParams.get('categoria') || ''
  const navigate = useNavigate()

  useEffect(() => { setActiveCategory(categoryParam || '') }, [categoryParam])

  const fetchLimit = limit

  const { data: productsResp = {}, isLoading } = useQuery({
    queryKey: ['products', activeCategory, searchQuery, page, fetchLimit],
    queryFn: () => productsApi.getAll({ category: activeCategory || undefined, search: searchQuery || undefined, page, limit: fetchLimit, sort: 'name', order: 'asc' }),
    select: (r) => r.data,
  })

  const products = productsResp.data || []
  const meta = productsResp.meta || null

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => configApi.get(),
    select: (r) => r.data,
  })

  return (
    <div className="bg-white">

      {/* ── Status banner ─────────────────────────────────────── */}
      <div className="bg-[#011a3d] text-slate-300 text-center py-2.5 text-xs font-medium tracking-wide">
        {config?.status_banner?.replace(/[^\x20-\x7E\u00C0-\u017E\u0020-\u024F\s]/g, '').trim() || 'Tienda abierta — Lun–Sáb 9:00 AM – 8:00 PM — Servicio técnico especializado disponible'}
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-[#011a3d] min-h-[92vh] flex items-center"
      >
        {/* Background mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-[#005fbf]/15 blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-[500px] h-[500px] rounded-full bg-[#2bb5ff]/8 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#033a82]/30 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-6 py-24 w-full"
        >
          <div className="hidden lg:block absolute right-14 top-[36%] -translate-y-1/2 z-10">
            <div className="w-[260px] xl:w-[320px] rounded-full overflow-hidden shadow-2xl shadow-slate-950/30">
              <img
                src="/logo.png"
                alt="Movilcenter Plus"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-8"
          >
            <img src="/logo.png" alt="Movilcenter Plus" className="w-14 h-14 rounded-3xl bg-white/10 p-2 shadow-lg shadow-black/10 object-cover" />
            <span className="text-[#2bb5ff] text-sm font-semibold tracking-[0.15em] uppercase">
              Movilcenter Plus
            </span>
          </motion.div>

            {/* Main headline — Apple-style oversized */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-6 text-balance"
            >
              Tecnología{' '}
              <span className="gradient-text block md:inline">profesional.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-slate-400 text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-light"
            >
              Smartphones, portátiles, repuestos y herramientas de reparación. Todo lo que necesitas en un solo lugar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center gap-2 bg-white text-[#022659] font-bold px-8 py-4 rounded-full hover:bg-[#e3f4ff] transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/20 text-sm tracking-wide"
              >
                Ver productos
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  if (config?.store_whatsapp) window.open(`https://wa.me/${config.store_whatsapp}`, '_blank')
                }}
                className="flex items-center gap-2 border border-white/20 text-white font-medium px-8 py-4 rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-sm tracking-wide"
              >
                Contactar por WhatsApp
              </button>
            </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-20 pt-12 border-t border-white/8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                { title: 'Inventario actualizado', description: 'Productos disponibles y listos para envío.' },
                { title: 'Soporte técnico especializado', description: 'Atención profesional para dispositivos y reparaciones.' },
                { title: 'Proveedores confiables', description: 'Piezas originales y procedimientos verificados.' },
                { title: 'Entrega local eficiente', description: 'Cobertura rápida para clientes de la región.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl bg-white/5 p-6 min-h-[170px]">
                  <div className="text-lg font-semibold text-white mb-3">{item.title}</div>
                  <div className="text-slate-300 text-sm leading-relaxed">{item.description}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>

      {/* ── Bento features — Samsung/Apple style ──────────────── */}
      <section className="bg-[#f8fafc] py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-[#005fbf] text-sm font-semibold tracking-[0.12em] uppercase mb-3">Por qué elegirnos</p>
            <h2 className="text-3xl md:text-5xl font-black text-[#011a3d] tracking-tight text-balance">
              Calidad sin compromisos
            </h2>
          </FadeUp>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 auto-rows-[180px]">

            {/* Large card */}
            <FadeUp
              delay={0.05}
              className="md:col-span-2 lg:col-span-3 row-span-2 bg-[#022659] rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group cursor-default"
            >
              <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#005fbf]/30 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute right-8 bottom-8 w-32 h-32 rounded-full bg-[#2bb5ff]/15 group-hover:scale-125 transition-transform duration-700 delay-75" />
              <div className="w-12 h-12 rounded-2xl bg-[#005fbf]/30 flex items-center justify-center">
                <Shield size={24} className="text-[#2bb5ff]" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">Repuestos originales y de calidad</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Trabajamos con proveedores confiables para ofrecer piezas revisadas y listas para instalar.</p>
              </div>
            </FadeUp>

            {/* Small cards */}
            <FadeUp delay={0.1} className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-[#e3f4ff] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={18} className="text-[#005fbf]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Diagnóstico rápido</h3>
                <p className="text-slate-500 text-xs leading-relaxed">Resultados en menos de 30 minutos para la mayoría de equipos</p>
              </div>
            </FadeUp>

            <FadeUp delay={0.15} className="lg:col-span-1 bg-[#005fbf] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
              <Award size={22} className="text-white/80" />
              <div>
                <div className="text-3xl font-black text-white">Expertos</div>
                <div className="text-white/70 text-xs font-medium mt-0.5">Soporte técnico con experiencia</div>
              </div>
            </FadeUp>

            <FadeUp delay={0.2} className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-[#e3f4ff] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench size={18} className="text-[#005fbf]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Técnicos especializados</h3>
                <p className="text-slate-500 text-xs leading-relaxed">Equipo con experiencia en dispositivos Apple, Samsung y Huawei</p>
              </div>
            </FadeUp>

            <FadeUp delay={0.25} className="lg:col-span-1 bg-[#011a3d] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#005fbf]/20" />
              <Clock size={22} className="text-[#2bb5ff]" />
              <div>
                <div className="text-xl font-black text-white leading-tight">Garantía incluida</div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Category tabs ──────────────────────────────────────── */}
      <div className="sticky top-[60px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams)
                  if (cat.slug) params.set('categoria', cat.slug)
                  else params.delete('categoria')
                  params.delete('buscar')
                  navigate(`/?${params.toString()}`)
                  setActiveCategory(cat.slug)
                }}
                className={`relative shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat.slug
                    ? 'bg-[#022659] text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products grid ──────────────────────────────────────── */}
      <section id="productos" className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <FadeUp className="mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#011a3d] tracking-tight">
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : activeCategory
              ? CATEGORIES.find((c) => c.slug === activeCategory)?.label
              : 'Productos destacados'}
          </h2>
          {!isLoading && (
            <p className="text-slate-400 mt-1 text-sm">
              {products.length} {products.length === 1 ? 'producto' : 'productos'}
            </p>
          )}
        </FadeUp>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Search size={28} className="text-slate-300" />
            </div>
            <p className="text-base font-semibold text-slate-500">Sin resultados</p>
            <button onClick={() => setActiveCategory('')} className="text-sm text-[#005fbf] hover:underline font-medium">
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        {/* Pagination controls */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded border"
            >Anterior</button>
            <div className="text-sm text-slate-600">Página {meta.page} de {meta.totalPages}</div>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded border"
            >Siguiente</button>
          </div>
        )}
      </section>

      {/* ── Info section ───────────────────────────────────────── */}
      <section className="bg-[#011a3d] py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-12">
            <p className="text-[#2bb5ff] text-sm font-semibold tracking-[0.12em] uppercase mb-3">Encuéntranos</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Estamos para servirte</h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: 'Ubicación',
                lines: [config?.store_address, config?.store_city].filter(Boolean),
                fallback: ['Av. Principal #123, Local 45', 'Tame, Arauca, Colombia'],
              },
              {
                icon: Clock,
                title: 'Horarios',
                lines: [config?.store_hours || 'Lun–Vie 9AM–8PM · Sáb 10AM–6PM · Dom Cerrado'],
                extra: 'Abierto ahora',
              },
              {
                icon: Phone,
                title: 'Contacto',
                lines: [config?.store_phone, config?.store_email].filter(Boolean),
                fallback: ['+57 300 123 4567', 'contacto@movilcenterplus.com'],
              },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.08}>
                <div className="bg-white/5 hover:bg-white/8 border border-white/8 rounded-3xl p-7 transition-colors group">
                  <div className="w-11 h-11 rounded-2xl bg-[#005fbf]/20 flex items-center justify-center mb-5 group-hover:bg-[#005fbf]/30 transition-colors">
                    <item.icon size={20} className="text-[#2bb5ff]" />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">{item.title}</h3>
                  {(item.lines.length > 0 ? item.lines : item.fallback).map((line) => (
                    <p key={line} className="text-slate-400 text-sm leading-relaxed">{line}</p>
                  ))}
                  {item.extra && (
                    <p className="text-emerald-400 text-xs font-semibold mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {item.extra}
                    </p>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
