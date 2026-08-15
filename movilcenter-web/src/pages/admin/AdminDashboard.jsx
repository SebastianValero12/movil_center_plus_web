// src/pages/admin/AdminDashboard.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Package, Tag, Settings, LogOut, Plus, Pencil, Trash2,
  BarChart3, AlertTriangle, Search, ChevronLeft, ChevronRight, X, Save, Loader2, Upload
} from 'lucide-react'
import { productsApi, categoriesApi, configApi } from '../../lib/api'
import ImportAccessories from '../../components/admin/ImportAccessories'
import useAuthStore from '../../store/authStore'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'inventory', label: 'Inventario', icon: Search },
  { id: 'categories', label: 'Categorías', icon: Tag },
  { id: 'config', label: 'Configuración', icon: Settings },
]

// ── Product Form Modal ────────────────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    oldPrice: product?.oldPrice || '',
    stock: product?.stock ?? '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    isFeatured: product?.isFeatured || false,
    isActive: product?.isActive ?? true,
  })
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form, files)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
            <input
              required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border-2 border-slate-200 focus:border-[#005fbf] rounded-xl px-3 py-2.5 outline-none text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea
              rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border-2 border-slate-200 focus:border-[#005fbf] rounded-xl px-3 py-2.5 outline-none text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Precio *</label>
            <input
              required type="number" min="0" step="0.01" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border-2 border-slate-200 focus:border-[#005fbf] rounded-xl px-3 py-2.5 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Precio anterior</label>
            <input
              type="number" min="0" step="0.01" value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
              placeholder="Dejar vacío si no aplica"
              className="w-full border-2 border-slate-200 focus:border-[#005fbf] rounded-xl px-3 py-2.5 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Stock</label>
            <input
              type="number" min="0" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border-2 border-slate-200 focus:border-[#005fbf] rounded-xl px-3 py-2.5 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">SKU</label>
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full border-2 border-slate-200 focus:border-[#005fbf] rounded-xl px-3 py-2.5 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border-2 border-slate-200 focus:border-[#005fbf] rounded-xl px-3 py-2.5 outline-none text-sm bg-white"
            >
              <option value="">Sin categoría</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-[#005fbf]"
              />
              <span className="text-sm font-semibold text-slate-700">Destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#005fbf]"
              />
              <span className="text-sm font-semibold text-slate-700">Activo</span>
            </label>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Imágenes / Videos {product ? '(se agregarán a las existentes)' : ''}
            </label>
            <label className="flex items-center gap-3 border-2 border-dashed border-slate-300 hover:border-[#005fbf] rounded-xl p-4 cursor-pointer transition-colors">
              <Upload size={20} className="text-slate-400" />
              <span className="text-sm text-slate-500">
                {files.length > 0 ? `${files.length} archivo(s) seleccionado(s)` : 'Haz clic para seleccionar archivos'}
              </span>
              <input
                type="file" multiple accept="image/*,video/*" className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
            </label>
          </div>

          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50">
              Cancelar
            </button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2.5 bg-[#005fbf] hover:bg-[#022659] text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [quickSearch, setQuickSearch] = useState('')
  const [quickCategory, setQuickCategory] = useState('accesorios')
  const [editingProduct, setEditingProduct] = useState(null)
  const [showNewProduct, setShowNewProduct] = useState(false)
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const qc = useQueryClient()

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => configApi.getStats(),
    select: (r) => r.data,
    enabled: activeTab === 'dashboard',
  })

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productsApi.getAdminAll({ page, limit: 10, search, sort: 'name', order: 'asc' }),
    select: (r) => r.data,
    enabled: activeTab === 'products',
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    select: (r) => r.data,
  })

  const { data: quickInventoryData, isLoading: loadingQuickInventory } = useQuery({
    queryKey: ['admin-quick-inventory', quickCategory, quickSearch, page],
    queryFn: () => productsApi.getAdminAll({ page, limit: 10, category: quickCategory, search: quickSearch, sort: 'name', order: 'asc' }),
    select: (r) => r.data,
    enabled: activeTab === 'inventory',
  })

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => configApi.get(),
    select: (r) => r.data,
    enabled: activeTab === 'config',
  })

  // Mutations
  const deleteProduct = useMutation({
    mutationFn: (id) => productsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); qc.invalidateQueries(['admin-quick-inventory']); toast.success('Producto eliminado') },
    onError: () => toast.error('Error al eliminar'),
  })

  async function handleSaveProduct(form, files) {
    if (editingProduct) {
      await productsApi.update(editingProduct.id, form)
      if (files.length > 0) await productsApi.uploadMedia(editingProduct.id, files)
      toast.success('Producto actualizado')
    } else {
      const { data } = await productsApi.create(form)
      if (files.length > 0) await productsApi.uploadMedia(data.id, files)
      toast.success('Producto creado')
    }
    qc.invalidateQueries(['admin-products'])
    qc.invalidateQueries(['admin-quick-inventory'])
    qc.invalidateQueries(['admin-stats'])
    setEditingProduct(null)
    setShowNewProduct(false)
  }

  async function handleSaveConfig(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    try {
      await configApi.update(data)
      qc.invalidateQueries(['config'])
      toast.success('Configuración guardada')
    } catch {
      toast.error('Error al guardar')
    }
  }

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  const products = productsData?.data || []
  const meta = productsData?.meta

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#022659] text-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#005fbf] rounded-xl flex items-center justify-center font-black text-sm">M+</div>
            <div>
              <p className="font-bold text-sm">Movilcenter Plus</p>
              <p className="text-white/50 text-xs">Panel Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#005fbf] text-white shadow-lg shadow-blue-900/50'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-3 mb-2">
            <p className="text-xs text-white/50">Conectado como</p>
            <p className="text-sm font-semibold truncate">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h1>
          <a href="/" target="_blank" className="text-sm text-[#005fbf] hover:underline">
            Ver tienda →
          </a>
        </div>

        <div className="p-6">

          {/* ── DASHBOARD ─────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total productos', value: stats?.totalProducts ?? '—', icon: Package, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Productos activos', value: stats?.activeProducts ?? '—', icon: Package, color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Stock bajo', value: stats?.lowStockProducts ?? '—', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
                  { label: 'Categorías', value: stats?.totalCategories ?? '—', icon: Tag, color: 'bg-purple-50 text-purple-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {stats?.byCategory?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h2 className="font-bold text-slate-800 mb-4">Productos por categoría</h2>
                  <div className="space-y-3">
                    {stats.byCategory.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600 w-32 shrink-0">{cat.name}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                          <div
                            className="bg-[#005fbf] h-2.5 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (cat.count / (stats.totalProducts || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700 w-6 text-right">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS ──────────────────────────────── */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar repuesto o accesorio..."
                      value={quickSearch}
                      onChange={(e) => { setQuickSearch(e.target.value); setPage(1) }}
                      className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 focus:border-[#005fbf] rounded-xl outline-none text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {['accesorios', 'accesorios-gamer', 'repuestos'].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => { setQuickCategory(category); setPage(1) }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                          quickCategory === category
                            ? 'bg-[#005fbf] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {category === 'accesorios' ? 'Accesorios' : category === 'accesorios-gamer' ? 'Accesorios Gamer' : 'Repuestos'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

                <div>
                  <ImportAccessories />
                </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingQuickInventory ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 6 }).map((_, j) => (
                              <td key={j} className="px-4 py-3">
                                <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : quickInventoryData?.data?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400">
                            No se encontraron productos para esta categoría.
                          </td>
                        </tr>
                      ) : (
                        quickInventoryData.data.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#e3f4ff] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                  {p.media?.[0]?.url ? (
                                    <img src={p.media[0].url} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <Package size={18} className="text-[#005fbf]" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                                  {p.sku && <p className="text-xs text-slate-400">SKU: {p.sku}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{p.category?.name || '—'}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{formatPrice(p.price)}</td>
                            <td className="px-4 py-3">
                              <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {p.stock}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {p.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="p-2 hover:bg-blue-50 hover:text-[#005fbf] rounded-lg transition-colors"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Eliminar "${p.name}"?`)) deleteProduct.mutate(p.id)
                                  }}
                                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {quickInventoryData?.meta?.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      {quickInventoryData.meta.total} productos · Página {quickInventoryData.meta.page} de {quickInventoryData.meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        disabled={page >= quickInventoryData.meta.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" placeholder="Buscar por nombre o SKU..."
                    value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 focus:border-[#005fbf] rounded-xl outline-none text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowNewProduct(true)}
                  className="flex items-center gap-2 bg-[#005fbf] hover:bg-[#022659] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus size={18} /> Nuevo producto
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingProducts ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 6 }).map((_, j) => (
                              <td key={j} className="px-4 py-3">
                                <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400">
                            No hay productos
                          </td>
                        </tr>
                      ) : (
                        products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#e3f4ff] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                  {p.media?.[0]?.url ? (
                                    <img src={p.media[0].url} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <Package size={18} className="text-[#005fbf]" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                                  {p.sku && <p className="text-xs text-slate-400">SKU: {p.sku}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{p.category?.name || '—'}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{formatPrice(p.price)}</td>
                            <td className="px-4 py-3">
                              <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {p.stock}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {p.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="p-2 hover:bg-blue-50 hover:text-[#005fbf] rounded-lg transition-colors"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Eliminar "${p.name}"?`)) deleteProduct.mutate(p.id)
                                  }}
                                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      {meta.total} productos · Página {meta.page} de {meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        disabled={page >= meta.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CONFIG ────────────────────────────────── */}
          {activeTab === 'config' && config && (
            <form onSubmit={handleSaveConfig} className="max-w-2xl space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-800 mb-2">Información de la tienda</h2>
                {[
                  { key: 'store_name', label: 'Nombre de la tienda' },
                  { key: 'store_address', label: 'Dirección' },
                  { key: 'store_city', label: 'Ciudad' },
                  { key: 'store_phone', label: 'Teléfono' },
                  { key: 'store_whatsapp', label: 'WhatsApp (solo números, ej: 573001234567)' },
                  { key: 'store_email', label: 'Email' },
                  { key: 'store_hours', label: 'Horarios de atención' },
                  { key: 'status_banner', label: 'Texto del banner de estado' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                    <input
                      name={key}
                      defaultValue={config[key] || ''}
                      className="w-full border-2 border-slate-200 focus:border-[#005fbf] rounded-xl px-3 py-2.5 outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#005fbf] hover:bg-[#022659] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                <Save size={16} /> Guardar configuración
              </button>
            </form>
          )}

          {/* ── CATEGORIES ────────────────────────────── */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Nombre</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Slug</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Productos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories?.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{cat.name}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{cat.slug}</td>
                      <td className="px-4 py-3 text-slate-600">{cat._count?.products ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {(showNewProduct || editingProduct) && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => { setShowNewProduct(false); setEditingProduct(null) }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  )
}
