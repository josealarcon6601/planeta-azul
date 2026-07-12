require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY no está configurada en el archivo .env');
  process.exit(1);
}

const app  = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', true);
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _, next) => { console.log(`${new Date().toISOString()} ${req.method} ${req.path}`); next(); });

app.use('/api/webhook',      require('./routes/webhook'));
app.use('/api/mensajes',     require('./routes/mensajes'));
app.use('/api/reservas',     require('./routes/reservas'));
app.use('/api/configuracion',require('./routes/configuracion'));
app.use('/api/precios',      require('./routes/precios'));

// Servir frontend compilado
const DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api'))
      res.sendFile(path.join(DIST, 'index.html'));
  });
  console.log('[Server] Frontend encontrado en:', DIST);
} else {
  console.warn('[Server] ⚠️  client/dist no existe — solo API disponible');
  app.get('/', (_, res) => res.json({ status: 'API corriendo', frontend: 'No compilado' }));
}

async function arrancar() {
  await require('./db').initDatabase();
  app.listen(PORT, () => {
    console.log(`\n🤿 Servidor en http://localhost:${PORT}`);
    console.log(`🔗 Webhook: http://localhost:${PORT}/api/webhook/whatsapp\n`);
  });
}

arrancar().catch(err => { console.error('Error al iniciar:', err); process.exit(1); });
