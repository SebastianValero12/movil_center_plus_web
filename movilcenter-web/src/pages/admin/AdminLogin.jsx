// src/pages/admin/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Bienvenido al panel admin')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#022659] via-[#005fbf] to-[#2bb5ff] flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo-icon.png" alt="Movilcenter Plus" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg shadow-blue-200 object-cover" />
          <h1 className="text-2xl font-black text-[#022659]">Panel Administrador</h1>
          <p className="text-slate-500 text-sm mt-1">Movilcenter Plus · Acceso privado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@movilcenterplus.com"
              required
              className="w-full px-4 py-3 border-2 border-slate-200 focus:border-[#005fbf] rounded-xl outline-none text-slate-800 transition-colors placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 focus:border-[#005fbf] rounded-xl outline-none text-slate-800 transition-colors placeholder:text-slate-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#005fbf] to-[#022659] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verificando...</> : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Área restringida — Solo personal autorizado
        </p>
      </div>
    </div>
  )
}
