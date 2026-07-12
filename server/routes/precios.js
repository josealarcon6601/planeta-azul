const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM precios ORDER BY categoria ASC, orden ASC, id ASC').all());
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener precios', detalle: e.message });
  }
});

router.post('/', (req, res) => {
  const { concepto, descripcion, precio, categoria, orden } = req.body;
  if (!concepto || precio === undefined || precio === null || isNaN(Number(precio)))
    return res.status(400).json({ error: 'concepto y precio (numérico) son obligatorios' });
  try {
    const r = db.prepare(`
      INSERT INTO precios (concepto, descripcion, precio, categoria, orden)
      VALUES (?,?,?,?,?)
    `).run(concepto, descripcion || null, Number(precio), categoria || 'General', Number(orden) || 0);
    res.status(201).json(db.prepare('SELECT * FROM precios WHERE id = ?').get(r.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: 'Error al crear precio', detalle: e.message });
  }
});

router.put('/:id', (req, res) => {
  const existe = db.prepare('SELECT id FROM precios WHERE id = ?').get(req.params.id);
  if (!existe) return res.status(404).json({ error: 'Precio no encontrado' });

  const { concepto, descripcion, precio, categoria, orden, activo } = req.body;
  if (precio !== undefined && isNaN(Number(precio)))
    return res.status(400).json({ error: 'precio debe ser numérico' });

  try {
    db.prepare(`
      UPDATE precios SET
        concepto    = COALESCE(?, concepto),
        descripcion = COALESCE(?, descripcion),
        precio      = COALESCE(?, precio),
        categoria   = COALESCE(?, categoria),
        orden       = COALESCE(?, orden),
        activo      = COALESCE(?, activo)
      WHERE id = ?
    `).run(
      concepto ?? null,
      descripcion ?? null,
      precio !== undefined ? Number(precio) : null,
      categoria ?? null,
      orden !== undefined ? Number(orden) : null,
      activo !== undefined ? (activo ? 1 : 0) : null,
      req.params.id
    );
    res.json(db.prepare('SELECT * FROM precios WHERE id = ?').get(req.params.id));
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar precio', detalle: e.message });
  }
});

router.delete('/:id', (req, res) => {
  const existe = db.prepare('SELECT id FROM precios WHERE id = ?').get(req.params.id);
  if (!existe) return res.status(404).json({ error: 'Precio no encontrado' });
  try {
    db.prepare('DELETE FROM precios WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Precio eliminado' });
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar precio', detalle: e.message });
  }
});

module.exports = router;
