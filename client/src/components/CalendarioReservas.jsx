import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { obtenerReservas, obtenerReservasPorFecha } from '../lib/api'
import { ChevronLeft, ChevronRight, User, Phone, Users } from 'lucide-react'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const BADGE = { confirmada:'bg-green-100 text-green-700', pendiente:'bg-yellow-100 text-yellow-700', cancelada:'bg-red-100 text-red-600', completada:'bg-blue-100 text-blue-700' }

const toStr = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const toHora = f => { const d = new Date(f); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }

export default function CalendarioReservas() {
  const hoy = new Date()
  const [mes, setMes] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [dia, setDia] = useState(toStr(hoy))

  const { data: todas = [] } = useQuery({ queryKey: ['reservas'], queryFn: obtenerReservas, refetchInterval: 5000 })
  const { data: del_dia = [], isLoading } = useQuery({ queryKey: ['reservas-dia', dia], queryFn: () => obtenerReservasPorFecha(dia), refetchInterval: 5000, enabled: !!dia })

  const conReservas = new Set(todas.filter(r => r.estado !== 'cancelada').map(r => r.fecha_reserva?.slice(0,10)).filter(Boolean))

  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const ultimoDia = new Date(mes.getFullYear(), mes.getMonth()+1, 0)
  const celdas = []
  for (let i = 0; i < primerDia.getDay(); i++) celdas.push(null)
  for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(new Date(mes.getFullYear(), mes.getMonth(), d))

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth()-1, 1))} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900">{MESES[mes.getMonth()]} {mes.getFullYear()}</h3>
          <button onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth()+1, 1))} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {celdas.map((d, i) => {
            if (!d) return <div key={`e${i}`} />
            const str  = toStr(d)
            const sel  = str === dia
            const hoyD = str === toStr(hoy)
            const tieneR = conReservas.has(str)
            return (
              <button key={str} onClick={() => setDia(str)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${sel ? 'bg-blue-700 text-white shadow-md' : hoyD ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-gray-100 text-gray-700'}`}>
                {d.getDate()}
                {tieneR && <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${sel ? 'bg-blue-200' : 'bg-gold-500'}`} />}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-gold-500 rounded-full" />Días con salidas</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-700 rounded-full" />Seleccionado</div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Salidas del día</h3>
        <p className="text-sm text-gray-500 mb-4">
          {dia ? new Date(dia + 'T12:00:00').toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' }) : 'Selecciona un día'}
        </p>
        {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" /></div>}
        {!isLoading && del_dia.length === 0 && <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-3">🌊</p><p className="text-sm font-medium text-gray-500">Sin reservas este día</p></div>}
        {!isLoading && del_dia.length > 0 && (
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 380 }}>
            {del_dia.map(r => (
              <div key={r.id} className="border border-gray-100 rounded-xl p-3 hover:border-blue-100 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-blue-700" /></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{r.nombre_cliente || 'Sin nombre'}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400"><Phone className="w-3 h-3" />{r.numero_telefono}</div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-700">{toHora(r.fecha_reserva)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">{r.tipo_actividad || 'Actividad'}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE[r.estado] || 'bg-gray-100 text-gray-600'}`}>{r.estado}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                  <Users className="w-3 h-3" />{r.num_personas || 1} persona{(r.num_personas || 1) > 1 ? 's' : ''}
                  {r.nivel_certificacion && <span className="ml-2 text-gray-400">· {r.nivel_certificacion}</span>}
                </div>
                {r.notas && <p className="text-xs text-gray-400 italic mt-1">{r.notas}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
