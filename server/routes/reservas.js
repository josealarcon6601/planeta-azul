const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM reservas ORDER BY fecha_reserva DESC').all());
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener reservas', detalle: e.message });
  }
});

router.get('/:fecha', (req, res) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.fecha))
    return res.status(400).json({ error: 'Formato de fecha inválido. Usar YYYY-MM-DD' });
  try {
    res.json(db.prepare(`
      SELECT * FROM reservas WHERE date(fecha_reserva) = ? ORDER BY fecha_reserva ASC
    `).all(req.params.fecha));
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener reservas', detalle: e.message });
  }
});

module.exports = router;
