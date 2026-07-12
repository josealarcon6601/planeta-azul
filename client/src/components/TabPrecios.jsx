import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obtenerPrecios, crearPrecio, actualizarPrecio, eliminarPrecio } from '../lib/api'
import { toast } from 'sonner'
import { Euro, Plus, Save, Trash2, Eye, EyeOff, X } from 'lucide-react'

function FilaPrecio({ precio }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ concepto: precio.concepto, descripcion: precio.descripcion || '', precio: precio.precio })
  const dirty = form.concepto !== precio.concepto || form.descripcion !== (precio.descripcion || '') || Number(form.precio) !== Number(precio.precio)

  const mutGuardar = useMutation({
    mutationFn: d => actualizarPrecio(precio.id, d),
    onSuccess: () => { toast.success('Precio actualizado'); qc.invalidateQueries({ queryKey: ['precios'] }) },
    onError: e => toast.error(`Error: ${e.message}`)
  })

  const mutToggle = useMutation({
    mutationFn: activo => actualizarPrecio(precio.id, { activo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['precios'] }),
    onError: e => toast.error(`Error: ${e.message}`)
  })

  const mutEliminar = useMutation({
    mutationFn: () => eliminarPrecio(precio.id),
    onSuccess: () => { toast.success('Precio eliminado'); qc.invalidateQueries({ queryKey: ['precios'] }) },
    onError: e => toast.error(`Error: ${e.message}`)
  })

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 sm:items-center px-4 py-3 rounded-xl border transition-colors ${precio.activo ? 'border-gray-100 hover:border-blue-100' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
      <input value={form.concepto} onChange={e => setForm(p => ({ ...p, concepto: e.target.value }))}
        className="sm:col-span-4 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción (opcional)"
        className="sm:col-span-4 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500" />
      <div className="sm:col-span-2 relative">
        <input type="number" step="0.01" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
          className="w-full pl-3 pr-7 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
        <span className="absolute right-2.5 top-2.5 text-gray-400 text-sm">€</span>
      </div>
      <div className="sm:col-span-2 flex items-center justify-end gap-1">
        {dirty && (
          <button onClick={() => mutGuardar.mutate(form)} disabled={mutGuardar.isPending}
            className="p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60" title="Guardar cambios">
            <Save className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={() => mutToggle.mutate(precio.activo ? 0 : 1)}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" title={precio.activo ? 'Ocultar (no se mostrará por WhatsApp)' : 'Activar'}>
          {precio.activo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => { if (confirm('¿Eliminar este precio?')) mutEliminar.mutate() }}
          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500" title="Eliminar">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function FormNuevoPrecio({ categoriaSugerida, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ concepto: '', descripcion: '', precio: '', categoria: categoriaSugerida || 'General' })

  const mut = useMutation({
    mutationFn: crearPrecio,
    onSuccess: () => { toast.success('Precio añadido'); qc.invalidateQueries({ queryKey: ['precios'] }); onClose() },
    onError: e => toast.error(`Error: ${e.message}`)
  })

  return (
    <form onSubmit={e => { e.preventDefault(); if (!form.concepto || form.precio === '') return toast.error('Concepto y precio son obligatorios'); mut.mutate(form) }}
      className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 sm:items-center px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/40">
      <input autoFocus value={form.concepto} onChange={e => setForm(p => ({ ...p, concepto: e.target.value }))} placeholder="Concepto (ej: Inmersión guiada Bajo de Piles)"
        className="sm:col-span-4 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción (opcional)"
        className="sm:col-span-4 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="sm:col-span-2 relative">
        <input type="number" step="0.01" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} placeholder="0.00"
          className="w-full pl-3 pr-7 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="absolute right-2.5 top-2.5 text-gray-400 text-sm">€</span>
      </div>
      <div className="sm:col-span-2 flex items-center justify-end gap-1">
        <button type="submit" disabled={mut.isPending} className="p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60"><Save className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-3.5 h-3.5" /></button>
      </div>
    </form>
  )
}

export default function TabPrecios() {
  const { data: precios = [], isLoading, isError } = useQuery({ queryKey: ['precios'], queryFn: obtenerPrecios })
  const [nuevoEn, setNuevoEn] = useState(null)
  const [nuevaCategoria, setNuevaCategoria] = useState(false)
  const [categoriaExtra, setCategoriaExtra] = useState('')

  const categorias = useMemo(() => {
    const mapa = new Map()
    precios.forEach(p => {
      const k = p.categoria || 'General'
      if (!mapa.has(k)) mapa.set(k, [])
      mapa.get(k).push(p)
    })
    if (categoriaExtra && !mapa.has(categoriaExtra)) mapa.set(categoriaExtra, [])
    return mapa
  }, [precios, categoriaExtra])

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" /></div>
  if (isError)   return <div className="text-center py-20 text-red-400"><p className="text-4xl mb-3">⚠️</p><p>Error al cargar precios</p></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2"><Euro className="w-5 h-5 text-blue-700" />Precios y tarifas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Coral consulta esta lista automáticamente por WhatsApp. Actualízala cuando quieras.</p>
        </div>
        <button onClick={() => setNuevaCategoria(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" />Nueva categoría
        </button>
      </div>

      {nuevaCategoria && (
        <form onSubmit={e => { e.preventDefault(); if (categoriaExtra.trim()) setNuevoEn(categoriaExtra.trim()); setNuevaCategoria(false) }}
          className="flex gap-2 bg-white border border-gray-200 rounded-xl p-3">
          <input autoFocus value={categoriaExtra} onChange={e => setCategoriaExtra(e.target.value)} placeholder="Nombre de la categoría (ej: Buceo técnico)"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800">Crear</button>
          <button type="button" onClick={() => setNuevaCategoria(false)} className="px-3 py-2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </form>
      )}

      {[...categorias.entries()].map(([categoria, items]) => (
        <div key={categoria} className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{categoria}</h3>
            {nuevoEn !== categoria && (
              <button onClick={() => setNuevoEn(categoria)} className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800">
                <Plus className="w-3.5 h-3.5" />Añadir precio
              </button>
            )}
          </div>
          <div className="space-y-2">
            {items.length === 0 && nuevoEn !== categoria && <p className="text-sm text-gray-400 py-2">Sin precios en esta categoría todavía.</p>}
            {items.map(p => <FilaPrecio key={p.id} precio={p} />)}
            {nuevoEn === categoria && <FormNuevoPrecio categoriaSugerida={categoria} onClose={() => setNuevoEn(null)} />}
          </div>
        </div>
      ))}

      {precios.length === 0 && !nuevaCategoria && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
          <p className="text-5xl mb-4">💶</p>
          <p className="font-medium text-gray-600">Todavía no hay precios cargados</p>
          <p className="text-sm mt-1">Crea una categoría para empezar a añadir tarifas</p>
        </div>
      )}
    </div>
  )
}
