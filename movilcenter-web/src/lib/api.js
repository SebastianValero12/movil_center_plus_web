// src/lib/api.js — Cliente HTTP centralizado
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

// Inyectar token JWT en cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirigir al login si el token expira
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mc_token')
      localStorage.removeItem('mc_user')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Productos ──────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getAdminAll: (params) => api.get('/products/admin/all', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  uploadMedia: (id, files) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    return api.post(`/products/${id}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteMedia: (productId, mediaId) =>
    api.delete(`/products/${productId}/media/${mediaId}`),
}

// ── Categorías ─────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
}

// ── Config tienda ──────────────────────────────────────────────────────────
export const configApi = {
  get: () => api.get('/config'),
  update: (data) => api.put('/config', data),
  getStats: () => api.get('/config/stats'),
}

// ── Importaciones (Excel) ─────────────────────────────────────────────────
export const importsApi = {
  importAccessories: (form, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    const url = `/imports/accessories${qs ? `?${qs}` : ''}`
    return api.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

export default api
