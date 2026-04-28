import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  const repoName = process.env.GITHUB_REPOSITORY
    ? '/' + process.env.GITHUB_REPOSITORY.split('/')[1]
    : '';
  return {
    base: repoName + '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.BASE_URL': JSON.stringify(repoName),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
