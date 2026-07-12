const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

const CAPACIDAD_BARCO = 12;

// Salidas típicas de un centro de buceo: mañana (doble inmersión), tarde (inmersión única), nocturna bajo petición
const SALIDAS_DEL_DIA = [
  { hora: '08:30', etiqueta: 'Salida de mañana (doble inmersión)' },
  { hora: '15:00', etiqueta: 'Salida de tarde (inmersión única)' },
  { hora: '20:00', etiqueta: 'Inmersión nocturna (bajo petición)' },
];

function formatearFecha(f) {
  if (!f) return 'Sin fecha';
  const d = new Date(f);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatearHora(f) {
  if (!f) return '';
  const d = new Date(f);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function generarSalidasDelDia() {
  return SALIDAS_DEL_DIA;
}

function formatearPrecio(p) {
  const n = Number(p) || 0;
  return n.toLocaleString('es-ES', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }) + ' €';
}

module.exports = { formatearFecha, formatearHora, generarSalidasDelDia, formatearPrecio, MESES, CAPACIDAD_BARCO, SALIDAS_DEL_DIA };
