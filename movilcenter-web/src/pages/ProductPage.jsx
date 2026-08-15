// src/pages/ProductPage.jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ShoppingCart, MessageCircle, ArrowLeft, CheckCircle,
  Star, Plus, Minus, Package, ChevronLeft, ChevronRight
} from 'lucide-react'
import { productsApi } from '../lib/api'
import useCartStore from '../store/cartStore'
import { formatPrice, formatWhatsAppProduct } from '../lib/utils'

const WHATSAPP_PHONE = '573001234567'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [activeMedia, setActiveMedia] = useState(0)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id),
    select: (res) => res.data,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="h-[500px] bg-slate-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-8 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
            <div className="h-12 bg-slate-100 rounded w-1/3 mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
        <Package size={64} strokeWidth={1} />
        <p className="text-lg font-medium text-slate-500">Producto no encontrado</p>
        <button onClick={() => navigate('/')} className="text-[#005fbf] hover:underline text-sm">
          Volver al inicio
        </button>
      </div>
    )
  }

  const media = product.media || []
  const currentMedia = media[activeMedia]
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100)
    : 0
  const inStock = product.stock > 0
  const maxQty = product.stock || 1

  function handleAddToCart() {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  function handleBuyNow() {
    const url = formatWhatsAppProduct(product, qty, WHATSAPP_PHONE)
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#005fbf] transition-colors"
        >
          <ArrowLeft size={16} /> Volver
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid md:grid-cols-2 gap-10 lg:gap-16">

        {/* Gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative h-[420px] md:h-[500px] bg-gradient-to-br from-[#e3f4ff] via-[#2bb5ff]/20 to-[#005fbf]/20 rounded-2xl overflow-hidden flex items-center justify-center">
            {currentMedia ? (
              currentMedia.type === 'VIDEO' ? (
                <video
                  src={currentMedia.url}
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <motion.img
                  key={activeMedia}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={currentMedia.url}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain p-6"
                />
              )
            ) : (
              <ShoppingCart size={80} className="text-[#005fbf]/30" strokeWidth={1} />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                  -{discountPct}%
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-[#005fbf] text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                  ⭐ Destacado
                </span>
              )}
            </div>

            {/* Nav arrows */}
            {media.length > 1 && (
              <>
                <button
                  onClick={() => setActiveMedia((p) => (p - 1 + media.length) % media.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-xl shadow hover:bg-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveMedia((p) => (p + 1) % media.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-xl shadow hover:bg-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {media.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {media.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMedia(i)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeMedia === i
                      ? 'border-[#005fbf] shadow-md shadow-blue-200'
                      : 'border-slate-200 hover:border-[#2bb5ff]'
                  }`}
                >
                  {m.type === 'VIDEO' ? (
                    <video src={m.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-contain p-1" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          {product.category && (
            <span className="inline-block bg-[#e3f4ff] text-[#005fbf] text-sm font-semibold px-3 py-1 rounded-full w-fit mb-3">
              {product.category.name}
            </span>
          )}

          <h1 className="text-3xl font-black text-slate-800 leading-tight mb-3">
            {product.name}
          </h1>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <span className="text-sm text-slate-500">4.8 · Producto verificado</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black text-[#022659]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-slate-400 line-through pb-1">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">
                  Ahorras {formatPrice(Number(product.oldPrice) - Number(product.price))}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-slate-600 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-slate-400 mb-4">SKU: {product.sku}</p>
          )}

          {/* Quantity selector (always visible). Stock checked via WhatsApp, so we don't display stock here. */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-semibold text-slate-700">Cantidad:</span>
            <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold text-lg">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-sm text-slate-500">
              Total: <strong className="text-slate-800">{formatPrice(Number(product.price) * qty)}</strong>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all ${
                added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#005fbf] hover:bg-[#022659] text-white hover:-translate-y-0.5 shadow-lg shadow-blue-200'
              }`}
            >
              {added ? <><CheckCircle size={20} /> ¡Agregado al carrito!</> : <><ShoppingCart size={20} /> Agregar al carrito</>}
            </button>

            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base bg-[#25D366] hover:bg-[#20b858] text-white transition-all hover:-translate-y-0.5 shadow-lg shadow-green-200"
            >
              <MessageCircle size={20} fill="currentColor" />
              Comprar por WhatsApp
            </button>
          </div>

          {/* Guarantees */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Garantía incluida' },
              { label: 'Entrega rápida' },
              { label: 'Soporte técnico' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Mobile sticky action bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 z-40">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs text-slate-500">Precio</div>
                <div className="text-lg font-bold text-[#022659]">{formatPrice(product.price)}</div>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#005fbf] text-white py-3 rounded-lg font-bold text-center"
              >
                <span>Agregar</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="ml-2 bg-[#25D366] text-white py-3 px-3 rounded-lg font-bold flex items-center gap-2"
              >
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
