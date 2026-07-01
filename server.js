import express from 'express';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const BASE_PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';
const distDir = path.join(__dirname, 'dist');
const stateDir = path.join(__dirname, 'data');
const stateFile = path.join(stateDir, 'state.json');

app.use(express.json({ limit: '10mb' }));

const emptyState = {
  agencies: [],
  drivers: [],
  internals: [],
  routeSheets: [],
  zones: [],
};

async function readState() {
  try {
    const raw = await readFile(stateFile, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      agencies: Array.isArray(parsed.agencies) ? parsed.agencies : [],
      drivers: Array.isArray(parsed.drivers) ? parsed.drivers : [],
      internals: Array.isArray(parsed.internals) ? parsed.internals : [],
      routeSheets: Array.isArray(parsed.routeSheets) ? parsed.routeSheets : [],
      zones: Array.isArray(parsed.zones) ? parsed.zones : [],
    };
  } catch {
    return emptyState;
  }
}

async function writeState(state) {
  await mkdir(stateDir, { recursive: true });
  await writeFile(stateFile, JSON.stringify(state, null, 2), 'utf8');
}

app.get('/api/state.php', async (_req, res) => {
  const state = await readState();
  res.json({ data: state });
});

app.put('/api/state.php', async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const state = {
    agencies: Array.isArray(body.agencies) ? body.agencies : [],
    drivers: Array.isArray(body.drivers) ? body.drivers : [],
    internals: Array.isArray(body.internals) ? body.internals : [],
    routeSheets: Array.isArray(body.routeSheets) ? body.routeSheets : [],
    zones: Array.isArray(body.zones) ? body.zones : [],
  };

  await writeState(state);
  res.json({ success: true, data: state });
});

app.post('/api/state.php', async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const state = {
    agencies: Array.isArray(body.agencies) ? body.agencies : [],
    drivers: Array.isArray(body.drivers) ? body.drivers : [],
    internals: Array.isArray(body.internals) ? body.internals : [],
    routeSheets: Array.isArray(body.routeSheets) ? body.routeSheets : [],
    zones: Array.isArray(body.zones) ? body.zones : [],
  };

  await writeState(state);
  res.json({ success: true, data: state });
});

app.options('/api/state.php', (_req, res) => {
  res.sendStatus(204);
});

app.use(express.static(distDir, { extensions: ['html'] }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

function startServer(port) {
  const server = app.listen(port, HOST, () => {
    const shownHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
    console.log(`LAN server ready at http://${shownHost}:${port}`);
  });

  server.on('error', (error) => {
    if (error && error.code === 'EADDRINUSE') {
      if (port < BASE_PORT + 10) {
        console.log(`Port ${port} busy, trying ${port + 1}...`);
        startServer(port + 1);
        return;
      }

      console.error(`No free port found between ${BASE_PORT} and ${BASE_PORT + 10}.`);
    } else {
      console.error(error);
    }
    process.exit(1);
  });
}

startServer(BASE_PORT);
