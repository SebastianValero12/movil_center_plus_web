import { useState } from 'react'
import { importsApi } from '../../lib/api'
import toast from 'react-hot-toast'

export default function ImportAccessories() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [onlyDesc, setOnlyDesc] = useState(false)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return toast.error('Selecciona un archivo .xlsx')
    const form = new FormData()
    form.append('file', file)
    setLoading(true)
    setResult(null)
    try {
      const params = {}
      if (onlyDesc) params.onlyDescription = 'true'
      // match by name when updating descriptions
      if (onlyDesc) params.matchBy = 'name'
      const { data } = await importsApi.importAccessories(form, params)
      setResult(data)
      toast.success('Importación procesada')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al importar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-3">Importar accesorios desde Excel</h3>
      <form onSubmit={handleUpload} className="space-y-3">
        <div>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyDesc} onChange={(e) => setOnlyDesc(e.target.checked)} className="w-4 h-4" />
            Actualizar solo descripción (buscar por nombre)
          </label>
        </div>
        <div className="flex gap-2">
          <button disabled={loading} className="px-4 py-2 bg-[#005fbf] text-white rounded-xl">
            {loading ? 'Subiendo...' : 'Subir y procesar'}
          </button>
          <button type="button" onClick={() => { setFile(null); setResult(null) }} className="px-4 py-2 border rounded-xl">
            Limpiar
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-4 text-sm text-slate-700">
          <p>Creado: <strong>{result.created}</strong></p>
          <p>Actualizado: <strong>{result.updated}</strong></p>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-2 text-red-600">
              <p className="font-semibold">Errores:</p>
              <ul className="list-disc list-inside max-h-40 overflow-auto">
                {result.errors.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
