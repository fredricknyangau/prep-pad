import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/responsive',
  testMatch: 'audit.spec.ts',
  timeout: 300000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
