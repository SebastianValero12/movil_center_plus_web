// src/lib/utils.js — Helpers globales

export function formatPrice(value) {
  const n = Number(value)
  if (isNaN(n)) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatWhatsAppOrder(items, total, phone) {
  const lines = items
    .map((i) => `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
    .join('\n')
  const msg = `¡Hola! Quiero realizar el siguiente pedido:\n\n${lines}\n\n*Total: ${formatPrice(total)}*\n\nPor favor confirmen disponibilidad.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

export function formatWhatsAppProduct(product, quantity, phone) {
  const price = Number(product.price)
  const total = price * quantity
  const msg = `¡Hola! Me interesa este producto:\n\n• *${product.name}*\n• Cantidad: ${quantity}\n• Precio unitario: ${formatPrice(price)}\n• Total: ${formatPrice(total)}\n\nPor favor confirmen disponibilidad.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
