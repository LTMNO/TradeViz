import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger, getRequestLogs, clearRequestLogs } from './middleware/requestLog.js';
import { registerRoutes } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

registerRoutes(app);

app.get('/api/debug/requests', (_req, res) => {
  res.json(getRequestLogs());
});

app.delete('/api/debug/requests', (_req, res) => {
  clearRequestLogs();
  res.json({ success: true });
});

const distPath = path.join(__dirname, '..', 'dist');
const indexHtml = path.join(distPath, 'index.html');

if (fs.existsSync(indexHtml)) {
  app.use(express.static(distPath));
  app.get('/', (_req, res) => {
    res.sendFile(indexHtml);
  });
  app.get(/^(?!\/functions\/|\/api\/).*/, (_req, res) => {
    res.sendFile(indexHtml);
  });
}

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || 'Request failed' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SS&C TradeViz mock running on http://0.0.0.0:${PORT}`);
  console.log('API endpoints are public — no auth required');
  if (!fs.existsSync(indexHtml)) {
    console.log('UI dev server: npm run dev:client (http://localhost:5174)');
  }
});
