// src/components/product/ProductCard.jsx
import { useState } from 'react'
import { ShoppingCart, Eye, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useCartStore from '../../store/cartStore'
import { formatPrice } from '../../lib/utils'

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const navigate = useNavigate()

  const image = product.media?.[0]?.url
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100)
    : 0
  const inStock = product.stock > 0

  function handleAddToCart(e) {
    e.stopPropagation()
    if (!inStock) return
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/60 transition-shadow duration-300"
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      {/* Image area */}
      <div className="relative h-44 sm:h-52 bg-gradient-to-br from-[#f0f9ff] to-[#e3f4ff] flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-5 group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-[#e3f4ff] flex items-center justify-center">
            <ShoppingCart size={32} className="text-[#005fbf]/40" strokeWidth={1.5} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              -{discountPct}%
            </span>
          )}
          {!inStock && (
            <span className="bg-slate-700/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              Agotado
            </span>
          )}
        </div>

        {/* Quick view — visible on hover */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={(e) => { e.stopPropagation(); navigate(`/producto/${product.id}`) }}
          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-[#005fbf] p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm border border-white"
        >
          <Eye size={15} strokeWidth={2} />
        </motion.button>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 pt-3.5">
        {product.category && (
          <span className="text-[10px] font-semibold text-[#005fbf] uppercase tracking-[0.08em]">
            {product.category.name}
          </span>
        )}

        <h3 className="font-bold text-slate-800 mt-1 mb-0.5 leading-snug line-clamp-2 text-[14px]">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-[12px] text-slate-400 line-clamp-2 mb-3 leading-relaxed mt-1">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3.5">
          <span className="text-xl font-black text-[#022659] tracking-tight">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through font-medium">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 ${
              added
                ? 'bg-emerald-500 text-white'
                : inStock
                ? 'bg-[#022659] hover:bg-[#005fbf] text-white hover:scale-105 active:scale-95 shadow-sm shadow-blue-900/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {added ? <><Check size={13} strokeWidth={3} /> Agregado</> : <><ShoppingCart size={13} strokeWidth={2} /> Agregar</>}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
