const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  try {
    res.json(db.prepare(`
      SELECT id, numero_telefono, contenido_mensaje, remitente, tipo_mensaje, procesado, recibido_en
      FROM mensajes_whatsapp ORDER BY recibido_en DESC LIMIT 50
    `).all());
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener mensajes', detalle: e.message });
  }
});

module.exports = router;
