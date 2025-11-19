import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the Gemini SDK
      // Defaults to empty string if undefined to prevent build/runtime crashes
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});