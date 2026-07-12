const BASE = '/api'

async function handle(res) {
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Error ${res.status}`) }
  return res.json()
}

export const obtenerMensajes        = () => fetch(`${BASE}/mensajes`).then(handle)
export const obtenerReservas        = () => fetch(`${BASE}/reservas`).then(handle)
export const obtenerReservasPorFecha = f  => fetch(`${BASE}/reservas/${f}`).then(handle)
export const obtenerConfiguracion   = () => fetch(`${BASE}/configuracion`).then(handle)
export const guardarConfiguracion   = d  => fetch(`${BASE}/configuracion`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d)
}).then(handle)

export const obtenerPrecios = () => fetch(`${BASE}/precios`).then(handle)
export const crearPrecio    = d  => fetch(`${BASE}/precios`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d)
}).then(handle)
export const actualizarPrecio = (id, d) => fetch(`${BASE}/precios/${id}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d)
}).then(handle)
export const eliminarPrecio = id => fetch(`${BASE}/precios/${id}`, { method: 'DELETE' }).then(handle)
