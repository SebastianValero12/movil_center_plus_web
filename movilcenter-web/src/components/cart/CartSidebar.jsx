// src/components/cart/CartSidebar.jsx
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import useCartStore from '../../store/cartStore'
import { formatPrice, formatWhatsAppOrder } from '../../lib/utils'
import { configApi } from '../../lib/api'

export default function CartSidebar({ isOpen, onClose }) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => configApi.get(),
    select: (r) => r.data,
  })

  function handleWhatsApp() {
    const phone = config?.store_whatsapp || '573001234567'
    window.open(formatWhatsAppOrder(items, subtotal, phone), '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white z-[80] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#022659] flex items-center justify-center">
                  <ShoppingBag size={16} className="text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Tu carrito</h2>
                  <p className="text-xs text-slate-400">
                    {items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center">
                      <ShoppingBag size={32} className="text-slate-300" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600 mb-1">Tu carrito está vacío</p>
                      <p className="text-sm text-slate-400">Agrega productos para iniciar tu pedido</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-2 px-6 py-2.5 bg-[#022659] text-white rounded-xl text-sm font-semibold hover:bg-[#005fbf] transition-colors"
                    >
                      Explorar productos
                    </button>
                  </motion.div>
                ) : (
                  <div className="p-4 space-y-2">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                      >
                        {/* Image */}
                        <div className="w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-[#f0f9ff] to-[#e3f4ff] flex items-center justify-center shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <ShoppingBag size={24} className="text-[#005fbf]/40" strokeWidth={1.5} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight mb-1">
                            {item.name}
                          </p>
                          <p className="text-sm font-bold text-[#005fbf]">{formatPrice(item.price)}</p>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                            <span className="text-xs font-bold text-slate-500 ml-auto">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="self-start mt-0.5 w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/50">
                <div className="bg-[#e3f4ff] rounded-2xl p-3.5 text-center text-xs font-medium text-[#022659]">
                  Consulta disponibilidad y métodos de envío por WhatsApp
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-700">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#022659] pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-colors text-sm tracking-wide shadow-lg shadow-green-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Confirmar pedido por WhatsApp
                </motion.button>

                <button
                  onClick={clearCart}
                  className="w-full text-xs text-slate-400 hover:text-red-400 transition-colors py-1 font-medium"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
