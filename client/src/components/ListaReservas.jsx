import { useQuery } from '@tanstack/react-query'
import { obtenerReservas } from '../lib/api'
import { Phone, Clock, User, Users } from 'lucide-react'

const BADGE = {
  confirmada: 'bg-green-100 text-green-700 border-green-200',
  pendiente:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelada:  'bg-red-100 text-red-600 border-red-200',
  completada: 'bg-blue-100 text-blue-700 border-blue-200',
}

function fmtFecha(f) {
  if (!f) return 'Sin fecha'
  return new Date(f).toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

export default function ListaReservas() {
  const { data: reservas = [], isLoading, isError } = useQuery({
    queryKey: ['reservas'], queryFn: obtenerReservas, refetchInterval: 5000
  })

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" /></div>
  if (isError)   return <div className="text-center py-20 text-red-400"><p className="text-4xl mb-3">⚠️</p><p>Error al cargar reservas</p></div>
  if (!reservas.length) return <div className="text-center py-20 text-gray-400"><p className="text-5xl mb-4">🤿</p><p className="font-medium text-gray-600">Sin reservas registradas</p></div>

  return (
    <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 600 }}>
      {reservas.map(r => (
        <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-blue-200 transition-colors">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{r.nombre_cliente || 'Sin nombre'}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500"><Phone className="w-3 h-3" />{r.numero_telefono}</div>
              </div>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${BADGE[r.estado] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {r.estado}
            </span>
          </div>
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span className="capitalize">{fmtFecha(r.fecha_reserva)}</span></div>
            {r.tipo_actividad && <div className="flex items-center gap-2"><span>🤿</span>{r.tipo_actividad}</div>}
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-4 h-4 text-gray-400" />{r.num_personas || 1} persona{(r.num_personas || 1) > 1 ? 's' : ''}
              {r.nivel_certificacion && <span>· {r.nivel_certificacion}</span>}
            </div>
            {r.notas && <p className="text-gray-400 italic text-xs">{r.notas}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
