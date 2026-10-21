/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  test: {
    testTimeout: 15000,
    exclude: ['**/node_modules/**', 'tests/responsive/**'],
  },
});
