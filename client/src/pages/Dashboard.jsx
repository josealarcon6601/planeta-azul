import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Waves, Settings, Euro, ArrowLeft, Globe } from 'lucide-react'
import TabMensajes from '../components/TabMensajes'
import TabReservas from '../components/TabReservas'
import TabPrecios from '../components/TabPrecios'
import TabConfiguracion from '../components/TabConfiguracion'

const TABS = [
  { id: 'mensajes',       label: 'Mensajes',       Icon: MessageSquare },
  { id: 'reservas',       label: 'Reservas',       Icon: Waves },
  { id: 'precios',        label: 'Precios',        Icon: Euro },
  { id: 'configuracion',  label: 'Configuración',  Icon: Settings },
]

export default function Dashboard() {
  const [tab, setTab] = useState('mensajes')
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="bg-blue-900 rounded-md px-2 py-1.5 flex items-center flex-shrink-0">
              <img src="/logo.svg" alt="Planeta Azul" className="h-3.5 sm:h-4 w-auto" />
            </div>
            <div className="border-l border-gray-200 pl-2 sm:pl-3 ml-0.5 sm:ml-1 min-w-0">
              <h1 className="font-bold text-gray-900 text-sm sm:text-base truncate">Panel de Control</h1>
              <p className="text-xs text-gray-500 truncate hidden sm:block">Planeta Azul — Cabo de Palos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gold-700 bg-gold-50 px-2.5 sm:px-3 py-1.5 rounded-full border border-gold-200" title="Idiomas detectados automáticamente: español, inglés, francés, alemán, italiano, neerlandés">
              <Globe className="w-3.5 h-3.5" />
              6 idiomas · 24/7
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-2.5 sm:px-3 py-1.5 rounded-full border border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Sistema activo</span>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap flex-shrink-0 transition-colors ${
                tab === id ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {tab === 'mensajes'      && <TabMensajes />}
        {tab === 'reservas'      && <TabReservas />}
        {tab === 'precios'       && <TabPrecios />}
        {tab === 'configuracion' && <TabConfiguracion />}
      </main>
    </div>
  )
}
