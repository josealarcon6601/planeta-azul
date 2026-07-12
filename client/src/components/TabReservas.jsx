import { useState } from 'react'
import { Calendar, List } from 'lucide-react'
import CalendarioReservas from './CalendarioReservas'
import ListaReservas from './ListaReservas'

export default function TabReservas() {
  const [vista, setVista] = useState('calendario')
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Gestión de Reservas</h2>
          <p className="text-sm text-gray-500 mt-0.5">Salidas de buceo reservadas por WhatsApp</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          {[['calendario','Calendario',Calendar],['lista','Lista',List]].map(([id,label,Icon]) => (
            <button key={id} onClick={() => setVista(id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${vista===id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>
      {vista === 'calendario' ? <CalendarioReservas /> : <ListaReservas />}
    </div>
  )
}
