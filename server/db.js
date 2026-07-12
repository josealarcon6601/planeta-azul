const path = require('path');
const fs   = require('fs');

const DB_PATH = path.join(__dirname, '..', 'planeta-azul.db');

let _db = null;

// ─── Statement: emula la API síncrona de better-sqlite3 ──────────────────────
class Stmt {
  constructor(sqlDb, sql, wrapper) {
    this._sql     = sql;
    this._sqlDb   = sqlDb;
    this._wrapper = wrapper;
  }

  _params(args) {
    if (!args.length) return [];
    return args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  }

  all(...args) {
    const stmt = this._sqlDb.prepare(this._sql);
    const p    = this._params(args);
    if (p.length) stmt.bind(p);
    const rows = [];
    while (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      const obj  = {};
      cols.forEach((c, i) => { obj[c] = vals[i]; });
      rows.push(obj);
    }
    stmt.free();
    return rows;
  }

  get(...args) {
    return this.all(...args)[0] ?? undefined;
  }

  run(...args) {
    const p = this._params(args);
    this._sqlDb.run(this._sql, p);
    const r  = this._sqlDb.exec('SELECT last_insert_rowid()');
    const id = r[0]?.values[0][0] ?? 0;
    this._wrapper._save();
    return { lastInsertRowid: id };
  }
}

// ─── Wrapper principal ────────────────────────────────────────────────────────
class DB {
  constructor(SQL) {
    this._db = fs.existsSync(DB_PATH)
      ? new SQL.Database(fs.readFileSync(DB_PATH))
      : new SQL.Database();
  }

  _save() {
    fs.writeFileSync(DB_PATH, Buffer.from(this._db.export()));
  }

  pragma() { /* no aplica en sql.js */ }

  exec(sql) {
    this._db.exec(sql);
    this._save();
    return this;
  }

  prepare(sql) {
    return new Stmt(this._db, sql, this);
  }
}

// ─── Proxy: permite require('./db') antes de que init() termine ───────────────
const api = {};
const proxy = new Proxy(api, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (!_db) throw new Error('[DB] No inicializada — esperá a initDatabase()');
    const v = _db[prop];
    return typeof v === 'function' ? v.bind(_db) : v;
  }
});

const PRECIOS_INICIALES = [
  // concepto, descripcion, precio, categoria, orden
  ['Bautismo de buceo', 'Primera inmersión guiada para quien nunca ha buceado, sin necesidad de titulación. Incluye equipo completo y instructor.', 90, 'Bautismo e iniciación', 1],

  ['Inmersión guiada — Costa de Cabo de Palos', 'Para buceadores certificados, con guía local', 45, 'Inmersiones guiadas', 2],
  ['Inmersión guiada — Bajo de Fuera', 'Bajo emblemático de la zona, meros y fauna variada', 60, 'Inmersiones guiadas', 3],
  ['Inmersión guiada — Pecio Naranjito', 'Inmersión en pecio', 45, 'Inmersiones guiadas', 4],
  ['Inmersión guiada — Reserva Marina Islas Hormigas', 'Incluye tasa de la reserva marina', 45, 'Inmersiones guiadas', 5],
  ['Inmersión guiada — Isla Grosa y Farallón', 'Salida a Isla Grosa', 60, 'Inmersiones guiadas', 6],
  ['Inmersión nocturna', 'Salida nocturna guiada', 52, 'Inmersiones guiadas', 7],

  ['Bono 5 inmersiones', 'Desde 200€ hasta 260€ según los puntos de inmersión elegidos', 200, 'Bonos de inmersión', 8],
  ['Bono 10 inmersiones', 'Desde 380€ hasta 470€ según los puntos de inmersión elegidos', 380, 'Bonos de inmersión', 9],

  ['Curso Scuba Diver', 'Primer nivel de certificación, IVA incluido', 345, 'Cursos de certificación', 10],
  ['Curso Open Water Diver', 'Certificación de buceador autónomo, IVA incluido', 470, 'Cursos de certificación', 11],
  ['Curso Open Water Diver Junior', 'Para buceadores más jóvenes, IVA incluido', 500, 'Cursos de certificación', 12],
  ['Curso Advanced Adventure', 'Continuación tras el Open Water', 400, 'Cursos de certificación', 13],
  ['Curso Rescue Diver', 'Incluye primeros auxilios y manejo de oxígeno', 500, 'Cursos de certificación', 14],

  ['Especialidad Aventura', 'Introducción a varias especialidades', 90, 'Especialidades', 15],
  ['Especialidad Nitrox', 'Buceo con mezclas enriquecidas en oxígeno', 140, 'Especialidades', 16],
  ['Especialidad Traje Seco (Dry Suit)', 'Buceo con traje seco', 220, 'Especialidades', 17],
  ['Especialidad Buceo Profundo (Deep Diving)', 'Inmersiones a mayor profundidad con seguridad', 300, 'Especialidades', 18],
  ['Buceador Recreativo AVELO', 'Oferta: antes 495€', 395, 'Especialidades', 19],
  ['Especialidad Ecosistemas Marinos', 'Buceo científico-divulgativo', 220, 'Especialidades', 20],
  ['Especialidad Buceo Científico', 'Para proyectos y estudios de fauna/flora marina', 340, 'Especialidades', 21],
  ['Master en Flotabilidad y Trim', 'Perfeccionamiento técnico de la flotabilidad', 490, 'Especialidades', 22],
  ['Refresh / puesta a punto', 'Desde 90€ hasta 280€ según lo que necesites repasar', 90, 'Especialidades', 23],

  ['Tasa Reserva Marina (por inmersión)', 'Tasa oficial aplicable a inmersiones dentro de la Reserva Marina de Cabo de Palos-Islas Hormigas', 5, 'Extras', 24],
];

// ─── init (async) — llamada desde server/index.js ────────────────────────────
async function initDatabase() {
  const SQL = await require('sql.js')({
    locateFile: f => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', f)
  });

  _db = new DB(SQL);

  _db._db.exec(`
    CREATE TABLE IF NOT EXISTS mensajes_whatsapp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_telefono TEXT NOT NULL,
      contenido_mensaje TEXT NOT NULL,
      remitente TEXT NOT NULL CHECK(remitente IN ('usuario','asistente')),
      tipo_mensaje TEXT NOT NULL DEFAULT 'texto',
      procesado INTEGER DEFAULT 0,
      recibido_en DATETIME DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_telefono TEXT NOT NULL,
      nombre_cliente TEXT,
      fecha_reserva DATETIME,
      tipo_actividad TEXT,
      num_personas INTEGER DEFAULT 1,
      nivel_certificacion TEXT,
      estado TEXT DEFAULT 'pendiente'
        CHECK(estado IN ('pendiente','confirmada','cancelada','completada')),
      notas TEXT,
      creado_en DATETIME DEFAULT (datetime('now','localtime')),
      actualizado_en DATETIME DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS configuracion_centro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_centro TEXT DEFAULT 'Planeta Azul',
      nombre_asistente TEXT DEFAULT 'Coral',
      direccion TEXT,
      telefono TEXT,
      whatsapp TEXT,
      email TEXT,
      idiomas TEXT,
      horarios TEXT,
      certificacion TEXT,
      sobre_centro TEXT,
      creado_en DATETIME DEFAULT (datetime('now','localtime')),
      actualizado_en DATETIME DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS precios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concepto TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL DEFAULT 0,
      categoria TEXT DEFAULT 'General',
      orden INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      actualizado_en DATETIME DEFAULT (datetime('now','localtime'))
    );

    CREATE TRIGGER IF NOT EXISTS trg_reserva_updated
    AFTER UPDATE ON reservas FOR EACH ROW
    BEGIN
      UPDATE reservas SET actualizado_en = datetime('now','localtime') WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_config_updated
    AFTER UPDATE ON configuracion_centro FOR EACH ROW
    BEGIN
      UPDATE configuracion_centro SET actualizado_en = datetime('now','localtime') WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_precio_updated
    AFTER UPDATE ON precios FOR EACH ROW
    BEGIN
      UPDATE precios SET actualizado_en = datetime('now','localtime') WHERE id = OLD.id;
    END;
  `);

  _db._save();

  const existeConfig = proxy.prepare('SELECT id FROM configuracion_centro LIMIT 1').get();
  if (!existeConfig) {
    proxy.prepare(`
      INSERT INTO configuracion_centro
        (nombre_centro, nombre_asistente, direccion, telefono, whatsapp, email, idiomas, horarios, certificacion, sobre_centro)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(
      'Planeta Azul',
      'Coral',
      'Paseo Dimas Ortega, 24, 30370 Cabo de Palos, Murcia (España)',
      '+34 968 56 45 32',
      '+34 605 594 162',
      'planeta@planeta-azul.com',
      'Español, English, Français',
      'Abierto todo el año — salidas diarias los 365 días. Salida de mañana (doble inmersión) sobre las 08:30-09:00, vuelta sobre las 13:00. Salida de tarde (inmersión única) sobre las 15:00-15:30. Inmersiones nocturnas disponibles bajo petición.',
      'SDI/TDI 5 Star Center — primer centro buceador National Geographic de España',
      'Planeta Azul es el primer centro de buceo National Geographic de España, en Cabo de Palos (Murcia), a 10 minutos en barco de la Reserva Marina de Cabo de Palos-Islas Hormigas (Top 20 mundial según National Geographic). Barco propio con capacidad para 12 buceadores, a 20 metros del centro. Ofrecemos bautismos, inmersiones guiadas, cursos de certificación SDI/TDI, especialidades técnicas y el innovador sistema de buceo AVELO. También programas de educación ambiental para colegios y universidades, y actividades de team building para empresas.'
    );
    console.log('[DB] Configuración inicial insertada');
  }

  const existePrecios = proxy.prepare('SELECT id FROM precios LIMIT 1').get();
  if (!existePrecios) {
    PRECIOS_INICIALES.forEach(([concepto, descripcion, precio, categoria, orden]) => {
      proxy.prepare(`
        INSERT INTO precios (concepto, descripcion, precio, categoria, orden)
        VALUES (?,?,?,?,?)
      `).run(concepto, descripcion, precio, categoria, orden);
    });
    console.log('[DB] Precios iniciales insertados');
  }

  console.log('[DB] Lista ✓');
  return proxy;
}

api.initDatabase = initDatabase;
module.exports = proxy;
