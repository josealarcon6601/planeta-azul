import { useQuery } from '@tanstack/react-query'
import { obtenerMensajes } from '../lib/api'
import { Phone, Bot, MessageCircle } from 'lucide-react'

function ts(f) {
  if (!f) return ''
  const d = new Date(f)
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${d.getDate()} ${meses[d.getMonth()]}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function TabMensajes() {
  const { data: msgs = [], isLoading, isError } = useQuery({
    queryKey: ['mensajes'], queryFn: obtenerMensajes, refetchInterval: 5000
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Mensajes Recientes</h2>
            <p className="text-sm text-gray-500">{msgs.length} mensajes — actualización cada 5s</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />En vivo
        </span>
      </div>

      <div className="overflow-y-auto" style={{ height: 600 }}>
        {isLoading && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Cargando mensajes...</p>
            </div>
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center h-full text-center text-red-400">
            <div><p className="text-4xl mb-3">⚠️</p><p className="font-medium">Error al cargar</p><p className="text-sm text-gray-400 mt-1">Verifica que el servidor esté corriendo</p></div>
          </div>
        )}
        {!isLoading && !isError && msgs.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-gray-400">
            <div><p className="text-5xl mb-4">💬</p><p className="font-medium text-gray-600">Sin mensajes todavía</p><p className="text-sm mt-1">Los mensajes de WhatsApp aparecerán aquí</p></div>
          </div>
        )}
        {!isLoading && msgs.length > 0 && (
          <div className="p-4 space-y-3">
            {msgs.map(m => {
              const esUser = m.remitente === 'usuario'
              return (
                <div key={m.id} className={`flex gap-3 ${esUser ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center ${esUser ? 'bg-gray-100' : 'bg-blue-100'}`}>
                    {esUser ? <Phone className="w-4 h-4 text-gray-500" /> : <Bot className="w-4 h-4 text-blue-700" />}
                  </div>
                  <div className={`max-w-[70%] ${esUser ? '' : 'items-end flex flex-col'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${esUser ? '' : 'flex-row-reverse'}`}>
                      <span className="text-xs text-gray-400">{m.numero_telefono}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${esUser ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                        {esUser ? 'Usuario' : 'Coral'}
                      </span>
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${esUser ? 'bg-gray-100 text-gray-800 rounded-tl-sm' : 'bg-blue-50 text-gray-800 rounded-tr-sm'}`}>
                      {m.contenido_mensaje}
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${esUser ? '' : 'text-right'}`}>{ts(m.recibido_en)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
