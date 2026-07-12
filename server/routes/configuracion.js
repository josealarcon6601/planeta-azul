const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  try {
    const cfg = db.prepare('SELECT * FROM configuracion_centro LIMIT 1').get();
    if (!cfg) return res.status(404).json({ error: 'No encontrada' });
    res.json(cfg);
  } catch (e) {
    res.status(500).json({ error: 'Error', detalle: e.message });
  }
});

router.put('/', (req, res) => {
  const { nombre_centro, nombre_asistente, direccion, telefono, whatsapp, email, idiomas, horarios, certificacion, sobre_centro } = req.body;
  try {
    db.prepare(`
      UPDATE configuracion_centro SET
        nombre_centro    = COALESCE(?, nombre_centro),
        nombre_asistente = COALESCE(?, nombre_asistente),
        direccion        = COALESCE(?, direccion),
        telefono         = COALESCE(?, telefono),
        whatsapp         = COALESCE(?, whatsapp),
        email            = COALESCE(?, email),
        idiomas          = COALESCE(?, idiomas),
        horarios         = COALESCE(?, horarios),
        certificacion    = COALESCE(?, certificacion),
        sobre_centro     = COALESCE(?, sobre_centro)
      WHERE id = 1
    `).run(
      nombre_centro||null, nombre_asistente||null, direccion||null, telefono||null, whatsapp||null,
      email||null, idiomas||null, horarios||null, certificacion||null, sobre_centro||null
    );

    const cfg = db.prepare('SELECT * FROM configuracion_centro LIMIT 1').get();
    res.json({ mensaje: 'Guardado exitosamente', config: cfg });
  } catch (e) {
    res.status(500).json({ error: 'Error al guardar', detalle: e.message });
  }
});

module.exports = router;
