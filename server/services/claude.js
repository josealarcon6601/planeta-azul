const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db');
const { generarSalidasDelDia, formatearFecha, formatearPrecio, CAPACIDAD_BARCO } = require('../utils/fechas');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODELO = 'claude-sonnet-5';

const tools = [
  {
    name: 'consultar_precios',
    description: 'Consulta la lista de precios vigente del centro de buceo (bautismo, inmersiones guiadas, bonos, cursos, especialidades). Úsala siempre que pregunten por precios, nunca inventes cifras.',
    input_schema: {
      type: 'object',
      properties: { categoria: { type: 'string', description: 'Filtrar por categoría (opcional): Bautismo e iniciación, Inmersiones guiadas, Bonos de inmersión, Cursos de certificación, Especialidades, Extras' } },
      required: []
    }
  },
  {
    name: 'consultar_disponibilidad',
    description: 'Consulta plazas libres y ocupadas en las salidas de barco (mañana, tarde, nocturna) para una fecha. El barco tiene una capacidad limitada por salida.',
    input_schema: {
      type: 'object',
      properties: { fecha: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' } },
      required: ['fecha']
    }
  },
  {
    name: 'ver_reservas_cliente',
    description: 'Lista las reservas activas de un cliente',
    input_schema: {
      type: 'object',
      properties: { numero_telefono: { type: 'string' } },
      required: ['numero_telefono']
    }
  },
  {
    name: 'agendar_reserva',
    description: 'Agenda una nueva reserva confirmada (bautismo, inmersión guiada, curso, etc.)',
    input_schema: {
      type: 'object',
      properties: {
        numero_telefono:     { type: 'string' },
        nombre_cliente:      { type: 'string' },
        fecha_reserva:       { type: 'string', description: 'ISO: YYYY-MM-DDTHH:MM:SS, debe coincidir con una salida (08:30, 15:00 o 20:00)' },
        tipo_actividad:      { type: 'string', description: 'Ej: Bautismo de buceo, Inmersión guiada Bajo de Fuera, Curso Open Water Diver' },
        num_personas:        { type: 'integer', description: 'Número de personas que se apuntan a esta salida' },
        nivel_certificacion: { type: 'string', description: 'Ej: Ninguno (bautismo), Open Water, Advanced, Rescue, etc.' },
        notas:               { type: 'string' }
      },
      required: ['numero_telefono', 'nombre_cliente', 'fecha_reserva', 'tipo_actividad', 'num_personas']
    }
  },
  {
    name: 'cancelar_reserva',
    description: 'Cancela una reserva por su ID',
    input_schema: {
      type: 'object',
      properties: { id_reserva: { type: 'integer' } },
      required: ['id_reserva']
    }
  },
  {
    name: 'reprogramar_reserva',
    description: 'Mueve una reserva a una nueva fecha/hora',
    input_schema: {
      type: 'object',
      properties: {
        id_reserva:  { type: 'integer' },
        nueva_fecha: { type: 'string', description: 'ISO: YYYY-MM-DDTHH:MM:SS, debe coincidir con una salida (08:30, 15:00 o 20:00)' }
      },
      required: ['id_reserva', 'nueva_fecha']
    }
  }
];

function plazasOcupadas(fechaISO, excluirId) {
  const filas = excluirId
    ? db.prepare(`SELECT num_personas FROM reservas WHERE fecha_reserva = ? AND estado IN ('pendiente','confirmada') AND id != ?`).all(fechaISO, excluirId)
    : db.prepare(`SELECT num_personas FROM reservas WHERE fecha_reserva = ? AND estado IN ('pendiente','confirmada')`).all(fechaISO);
  return filas.reduce((acc, r) => acc + (r.num_personas || 1), 0);
}

function ejecutarTool(nombre, args) {
  console.log(`[IA] Tool: ${nombre}`, JSON.stringify(args));
  switch (nombre) {
    case 'consultar_precios': {
      const rows = args.categoria
        ? db.prepare('SELECT concepto, descripcion, precio, categoria FROM precios WHERE activo = 1 AND categoria = ? ORDER BY orden ASC').all(args.categoria)
        : db.prepare('SELECT concepto, descripcion, precio, categoria FROM precios WHERE activo = 1 ORDER BY orden ASC').all();
      return { precios: rows.map(r => ({ ...r, precio_formateado: formatearPrecio(r.precio) })) };
    }
    case 'consultar_disponibilidad': {
      const salidas = generarSalidasDelDia().map(s => {
        const fechaISO = `${args.fecha}T${s.hora}:00`;
        const ocupadas = plazasOcupadas(fechaISO);
        return { hora: s.hora, salida: s.etiqueta, plazas_totales: CAPACIDAD_BARCO, plazas_ocupadas: ocupadas, plazas_libres: Math.max(0, CAPACIDAD_BARCO - ocupadas) };
      });
      return { fecha: args.fecha, salidas };
    }
    case 'ver_reservas_cliente': {
      const reservas = db.prepare(`
        SELECT id, nombre_cliente, fecha_reserva, tipo_actividad, num_personas, nivel_certificacion, estado, notas FROM reservas
        WHERE numero_telefono = ? AND estado != 'cancelada' ORDER BY fecha_reserva ASC
      `).all(args.numero_telefono);
      return { reservas: reservas.map(r => ({ ...r, fecha_formateada: formatearFecha(r.fecha_reserva) })) };
    }
    case 'agendar_reserva': {
      const personas = Number(args.num_personas) || 1;
      const ocupadas = plazasOcupadas(args.fecha_reserva);
      if (ocupadas + personas > CAPACIDAD_BARCO) {
        return { exito: false, error: `No hay suficientes plazas en esa salida. Libres: ${Math.max(0, CAPACIDAD_BARCO - ocupadas)}.` };
      }
      const r = db.prepare(`
        INSERT INTO reservas (numero_telefono, nombre_cliente, fecha_reserva, tipo_actividad, num_personas, nivel_certificacion, estado, notas)
        VALUES (?,?,?,?,?,?,'confirmada',?)
      `).run(args.numero_telefono, args.nombre_cliente, args.fecha_reserva, args.tipo_actividad, personas, args.nivel_certificacion || null, args.notas || null);
      return { exito: true, id_reserva: r.lastInsertRowid, mensaje: `Reserva confirmada para ${args.nombre_cliente} (${personas} persona/s) el ${formatearFecha(args.fecha_reserva)}` };
    }
    case 'cancelar_reserva': {
      const r = db.prepare('SELECT nombre_cliente, fecha_reserva FROM reservas WHERE id = ?').get(args.id_reserva);
      if (!r) return { exito: false, error: 'Reserva no encontrada.' };
      db.prepare("UPDATE reservas SET estado = 'cancelada' WHERE id = ?").run(args.id_reserva);
      return { exito: true, mensaje: `Reserva de ${r.nombre_cliente} cancelada.` };
    }
    case 'reprogramar_reserva': {
      const r = db.prepare("SELECT nombre_cliente, num_personas FROM reservas WHERE id = ? AND estado != 'cancelada'").get(args.id_reserva);
      if (!r) return { exito: false, error: 'Reserva no encontrada o ya cancelada.' };
      const ocupadas = plazasOcupadas(args.nueva_fecha, args.id_reserva);
      if (ocupadas + (r.num_personas || 1) > CAPACIDAD_BARCO) {
        return { exito: false, error: `No hay suficientes plazas en la nueva salida. Libres: ${Math.max(0, CAPACIDAD_BARCO - ocupadas)}.` };
      }
      db.prepare('UPDATE reservas SET fecha_reserva = ? WHERE id = ?').run(args.nueva_fecha, args.id_reserva);
      return { exito: true, mensaje: `Reserva de ${r.nombre_cliente} movida al ${formatearFecha(args.nueva_fecha)}` };
    }
    default: return { error: `Tool desconocida: ${nombre}` };
  }
}

async function procesarMensajeConIA(mensaje, telefono, config, historial) {
  const nombreAsistente = config.nombre_asistente || 'Coral';

  const system = `You are ${nombreAsistente}, the virtual assistant for ${config.nombre_centro}, a diving center in Cabo de Palos (Murcia, Spain). You answer messages from current and potential divers via WhatsApp — 24/7, in the language the customer writes in.

LANGUAGE
- Auto-detect the language of each incoming message (Spanish, English, French, German, Italian, Dutch — or any other language the customer uses).
- Always reply in that same language. Never mix languages in one reply.
- If you are genuinely uncertain which language it is, default to English.
- The data you get back from tools (concepts, descriptions, activity names) is stored in Spanish. Translate/paraphrase it naturally into the customer's language — never paste raw Spanish tool text into a reply in another language.

TONE
- Warm, professional, adventurous. Short sentences.
- Max 1 emoji per reply, and only from this set: 🤿 🐠 🌊 ⚓
- Never corporate. Talk like a diving instructor who loves the sea.
- No markdown symbols at all (no asterisks, underscores, hashes). Plain text only — use line breaks and the occasional emoji for structure.

GOLDEN RULES (in priority order)
1. If you know the answer with the tools/info you have, answer clearly and directly. Use consultar_precios for anything about prices and consultar_disponibilidad for anything about dates/spots — never invent prices, dates, or availability from memory.
2. If you don't know how to answer something (it's outside diving info, prices, bookings, or the center's own activities), say plainly and honestly that you can't answer that, and immediately hand off by giving the center's contact details so a human can help: phone ${config.telefono || ''}, WhatsApp ${config.whatsapp || config.telefono || ''}, email ${config.email || ''}. Do not guess or make something up to sound helpful.
3. If the customer asks about medical restrictions/fitness to dive, or about diving conditions in bad weather/sea state, ALWAYS redirect to human staff — do not attempt to answer even partially: say you'd rather have an instructor confirm this with them personally, and offer to pass their contact to the team.
4. Every conversation that involves interest in diving with us (booking, pricing questions, course questions) should end by asking for: name, number of divers (adults / children with age if relevant), certification level(s) if any, dates they're considering, and best contact (email or phone) — so the team can confirm availability.
5. Never invent prices, dates, or dive site availability under any circumstance.

CENTER INFO
- Name: ${config.nombre_centro}
- Location: ${config.direccion || 'Cabo de Palos, Murcia (España)'}
- Phone: ${config.telefono || 'No especificado'}
- WhatsApp: ${config.whatsapp || config.telefono || 'No especificado'}
- Email: ${config.email || 'No especificado'}
- Languages spoken by the team: ${config.idiomas || 'Español, English, Français'}
- Certification body: ${config.certificacion || 'SDI/TDI 5 Star Center'}
- Schedule: ${config.horarios || 'Open year-round, daily departures'}
- About us: ${config.sobre_centro || ''}

The customer's WhatsApp number is already known to you (it is ${telefono}): use it directly in tools (numero_telefono, ver_reservas_cliente, agendar_reserva, etc.) without asking for it or mentioning it, unless they explicitly say they want to use a different number.

BOOKING RULES
- To book (agendar_reserva) always confirm first: full name, exact date, which activity (bautismo, which guided dive/site, which course), and number of people. Ask for certification level if it's a guided dive or course that requires one.
- Bookings only happen at one of the boat's daily departures — check consultar_disponibilidad before confirming a date/time, never assume there's room.
- Never invent information you don't have.

Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (also: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} in Spanish).`;

  const mensajes = [];
  historial.forEach(m => mensajes.push({ role: m.remitente === 'usuario' ? 'user' : 'assistant', content: m.contenido_mensaje }));
  mensajes.push({ role: 'user', content: mensaje });

  let resp = await anthropic.messages.create({ model: MODELO, max_tokens: 800, system, messages: mensajes, tools });

  while (resp.stop_reason === 'tool_use') {
    mensajes.push({ role: 'assistant', content: resp.content });
    const resultados = resp.content
      .filter(b => b.type === 'tool_use')
      .map(b => ({ type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(ejecutarTool(b.name, b.input)) }));
    mensajes.push({ role: 'user', content: resultados });
    resp = await anthropic.messages.create({ model: MODELO, max_tokens: 800, system, messages: mensajes, tools });
  }

  const textoFinal = resp.content.find(b => b.type === 'text');
  return textoFinal?.text || 'Sorry, something went wrong. Please try again.';
}

module.exports = { procesarMensajeConIA };
