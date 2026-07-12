const express  = require('express');
const router   = express.Router();
const rateLimit = require('express-rate-limit');
const twilio   = require('twilio');
const db       = require('../db');
const { procesarMensajeConIA } = require('../services/claude');
const { generarTwiML }         = require('../services/twilio');

const limiter = rateLimit({
  windowMs: 60 * 1000, max: 30,
  keyGenerator: req => req.body?.From || req.ip,
});

function validarFirmaTwilio(req, res, next) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.warn('[Webhook] ⚠️  TWILIO_AUTH_TOKEN no configurado — se omite validación de firma de Twilio');
    return next();
  }
  const firma = req.headers['x-twilio-signature'];
  const url   = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  if (!twilio.validateRequest(authToken, firma, url, req.body)) {
    console.warn(`[Webhook] Firma de Twilio inválida (ip=${req.ip})`);
    return res.status(403).send('Firma inválida');
  }
  next();
}

router.post('/whatsapp', validarFirmaTwilio, limiter, async (req, res) => {
  const ts      = new Date().toISOString();
  const texto   = req.body?.Body?.trim();
  const telefono = (req.body?.From || '').replace('whatsapp:', '');

  console.log(`[${ts}] Mensaje de ${telefono}: "${texto}"`);

  if (!texto || !telefono) {
    res.setHeader('Content-Type', 'text/xml');
    return res.send(generarTwiML('No pude procesar tu mensaje.'));
  }

  try {
    db.prepare(`INSERT INTO mensajes_whatsapp (numero_telefono, contenido_mensaje, remitente) VALUES (?,?,'usuario')`).run(telefono, texto);

    const config   = db.prepare('SELECT * FROM configuracion_centro LIMIT 1').get();
    const historial = db.prepare(`
      SELECT contenido_mensaje, remitente FROM mensajes_whatsapp
      WHERE numero_telefono = ? ORDER BY recibido_en DESC LIMIT 20
    `).all(telefono).reverse();

    const respuesta = await procesarMensajeConIA(texto, telefono, config, historial);

    db.prepare(`INSERT INTO mensajes_whatsapp (numero_telefono, contenido_mensaje, remitente, procesado) VALUES (?,?,'asistente',1)`).run(telefono, respuesta);

    res.setHeader('Content-Type', 'text/xml');
    res.send(generarTwiML(respuesta));

  } catch (err) {
    console.error(`[${ts}] Error en webhook:`, err.message);
    let tel = '';
    try { tel = db.prepare('SELECT telefono FROM configuracion_centro LIMIT 1').get()?.telefono || ''; } catch {}
    res.setHeader('Content-Type', 'text/xml');
    res.send(generarTwiML(`Disculpa, estoy teniendo problemas técnicos. ${tel ? `Llama al ${tel}.` : 'Inténtalo de nuevo en unos minutos.'}`));
  }
});

module.exports = router;
