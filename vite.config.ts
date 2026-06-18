import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isOfflineDemo = mode === 'offline' || process.env.VITE_OFFLINE_DEMO === 'true' || env.VITE_OFFLINE_DEMO === 'true';
  const repoName = process.env.GITHUB_REPOSITORY
    ? '/' + process.env.GITHUB_REPOSITORY.split('/')[1]
    : '';
  const base = isOfflineDemo ? './' : repoName + '/';
  return {
    base,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.BASE_URL': JSON.stringify(isOfflineDemo ? '.' : repoName),
      'import.meta.env.VITE_WORKER_URL': JSON.stringify(process.env.VITE_WORKER_URL || env.VITE_WORKER_URL || ''),
      'import.meta.env.VITE_OFFLINE_DEMO': JSON.stringify(isOfflineDemo ? 'true' : 'false'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: isOfflineDemo ? {
      cssCodeSplit: false,
      modulePreload: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          entryFileNames: 'assets/offline-app.js',
          format: 'iife',
          name: 'ICCCOfflineDemo',
        },
      },
    } : undefined,
  };
});
