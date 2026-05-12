import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const MODULES_PATH = path.resolve(__dirname, 'src/data/modules.json');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-modules-api',
      configureServer(server) {
        server.middlewares.use('/api/dev/modules', (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405);
            res.end();
            return;
          }
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              fs.writeFileSync(MODULES_PATH, JSON.stringify(data, null, 2) + '\n');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: String(e) }));
            }
          });
        });
      },
    },
  ],
});
