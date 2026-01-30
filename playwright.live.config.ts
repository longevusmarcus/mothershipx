import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load secrets from .env.secrets.local
dotenv.config({ path: path.resolve(__dirname, '.env.secrets.local') });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially for visual following
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for live testing
  workers: 1, // Single worker for visual following
  reporter: 'list', // Simple list output
  timeout: 120000, // 2 minutes per test
  use: {
    baseURL: 'https://mothershipx.dev',
    trace: 'on', // Always capture trace for debugging

    // Visual debugging - see the browser
    headless: false,
    launchOptions: {
      slowMo: 1000, // 1 second delay between actions
    },

    // Viewport
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer - we're testing against live site
});
