function generarTwiML(mensaje) {
  const esc = mensaje
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message><Body>${esc}</Body></Message>\n</Response>`;
}
module.exports = { generarTwiML };
