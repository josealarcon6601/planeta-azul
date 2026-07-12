import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obtenerConfiguracion, guardarConfiguracion } from '../lib/api'
import { toast } from 'sonner'
import { Copy, Check, Save, Settings, Link, Bot } from 'lucide-react'

const Campo = ({ label, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
)

const Input = ({ value, onChange, placeholder, type='text' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
)

const Textarea = ({ value, onChange, placeholder, rows=3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" />
)

export default function TabConfiguracion() {
  const qc = useQueryClient()
  const [copiado, setCopiado] = useState(false)
  const [form, setForm] = useState({ nombre_centro:'', nombre_asistente:'', direccion:'', telefono:'', whatsapp:'', email:'', idiomas:'', horarios:'', certificacion:'', sobre_centro:'' })

  const webhookUrl = `${window.location.protocol}//${window.location.host}/api/webhook/whatsapp`

  const { data: cfg, isLoading } = useQuery({ queryKey: ['configuracion'], queryFn: obtenerConfiguracion })

  useEffect(() => {
    if (cfg) setForm({
      nombre_centro:    cfg.nombre_centro    || '',
      nombre_asistente: cfg.nombre_asistente || '',
      direccion:        cfg.direccion        || '',
      telefono:         cfg.telefono         || '',
      whatsapp:         cfg.whatsapp         || '',
      email:            cfg.email            || '',
      idiomas:          cfg.idiomas          || '',
      horarios:         cfg.horarios         || '',
      certificacion:    cfg.certificacion    || '',
      sobre_centro:     cfg.sobre_centro     || ''
    })
  }, [cfg])

  const mut = useMutation({
    mutationFn: guardarConfiguracion,
    onSuccess: () => { toast.success('Configuración guardada'); qc.invalidateQueries({ queryKey: ['configuracion'] }) },
    onError: e => toast.error(`Error: ${e.message}`)
  })

  async function copiar() {
    try { await navigator.clipboard.writeText(webhookUrl); setCopiado(true); toast.success('URL copiada'); setTimeout(() => setCopiado(false), 2000) }
    catch { toast.error('No se pudo copiar') }
  }

  const set = k => v => setForm(p => ({ ...p, [k]: v }))

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Webhook */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center"><Link className="w-5 h-5 text-gold-700" /></div>
          <div><h2 className="font-semibold text-gray-900">URL del Webhook</h2><p className="text-sm text-gray-500">Pega esta URL en Twilio</p></div>
        </div>
        <div className="flex gap-3 mb-5">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 font-mono overflow-x-auto">{webhookUrl}</code>
          <button onClick={copiar} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${copiado ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
            {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-900">
          <p className="font-semibold mb-2">Cómo configurar Twilio:</p>
          <ol className="space-y-1">
            <li><strong>1.</strong> Twilio Console → Messaging → WhatsApp Sandbox</li>
            <li><strong>2.</strong> En "When a message comes in" pega la URL de arriba</li>
            <li><strong>3.</strong> Método: <strong>HTTP POST</strong> → Guardar</li>
          </ol>
          <p className="mt-3 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            💡 En desarrollo usa <strong>ngrok</strong>: <code>npx ngrok http 3006</code>
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Settings className="w-5 h-5 text-blue-700" /></div>
          <div><h2 className="font-semibold text-gray-900">Datos del Centro de Buceo</h2><p className="text-sm text-gray-500">La IA usa esta info para atender a los buceadores</p></div>
        </div>
        <form onSubmit={e => { e.preventDefault(); mut.mutate(form) }} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Campo label="Nombre del centro"><Input value={form.nombre_centro} onChange={set('nombre_centro')} placeholder="Planeta Azul" /></Campo>
            <Campo label="Nombre del asistente IA" hint="Así se presentará por WhatsApp">
              <div className="relative">
                <Bot className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input value={form.nombre_asistente} onChange={e => set('nombre_asistente')(e.target.value)} placeholder="Coral"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>
            </Campo>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            <Campo label="Teléfono"><Input value={form.telefono} onChange={set('telefono')} placeholder="+34 968 56 45 32" /></Campo>
            <Campo label="WhatsApp"><Input value={form.whatsapp} onChange={set('whatsapp')} placeholder="+34 605 594 162" /></Campo>
            <Campo label="Email"><Input value={form.email} onChange={set('email')} placeholder="info@centro.com" type="email" /></Campo>
          </div>
          <Campo label="Dirección"><Input value={form.direccion} onChange={set('direccion')} placeholder="Paseo Dimas Ortega, 24, Cabo de Palos" /></Campo>
          <div className="grid sm:grid-cols-2 gap-5">
            <Campo label="Idiomas del equipo" hint="Separados por comas"><Input value={form.idiomas} onChange={set('idiomas')} placeholder="Español, English, Français" /></Campo>
            <Campo label="Certificación / sello"><Input value={form.certificacion} onChange={set('certificacion')} placeholder="SDI/TDI 5 Star Center" /></Campo>
          </div>
          <Campo label="Horario / temporada"><Textarea value={form.horarios} onChange={set('horarios')} placeholder="Abierto todo el año, salidas diarias..." rows={2} /></Campo>
          <Campo label="Sobre el centro"><Textarea value={form.sobre_centro} onChange={set('sobre_centro')} placeholder="Descripción, reserva marina, capacidad del barco..." rows={4} /></Campo>
          <p className="text-xs text-gray-400 -mt-2">Los precios y tarifas se gestionan desde la pestaña "Precios".</p>
          <button type="submit" disabled={mut.isPending}
            className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors disabled:opacity-60">
            {mut.isPending
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
              : <><Save className="w-4 h-4" />Guardar Cambios</>}
          </button>
        </form>
      </div>
    </div>
  )
}
