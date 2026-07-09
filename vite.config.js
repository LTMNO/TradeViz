import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = (env.BASE_PATH || '').replace(/\/$/, '');
  const base = basePath ? `${basePath}/` : '/';

  const proxy = basePath
    ? {
        [`${basePath}/functions`]: {
          target: 'http://localhost:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${basePath}`), ''),
        },
        [`${basePath}/api`]: {
          target: 'http://localhost:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${basePath}`), ''),
        },
      }
    : {
        '/functions': 'http://localhost:3002',
        '/api': 'http://localhost:3002',
      };

  return {
    plugins: [react()],
    base,
    server: {
      port: 5174,
      proxy,
    },
  };
});
