import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against a production build (`nuxt build`, then the
// Nitro server), not `nuxt dev`: no dependency pre-bundling reloads, and the
// same output that gets deployed. See tests/e2e/README.md.
const PORT = Number(process.env.E2E_PORT ?? 3179)
const baseURL = `http://127.0.0.1:${PORT}`
const CI = !!process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/e2e/test-results',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    [CI ? 'github' : 'list'],
    ['html', { open: 'never', outputFolder: './tests/e2e/playwright-report' }],
  ],
  use: {
    baseURL,
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && node .output/server/index.mjs',
    url: baseURL,
    reuseExistingServer: !CI,
    timeout: 180_000,
    env: {
      NITRO_HOST: '127.0.0.1',
      NITRO_PORT: String(PORT),
      NUXT_TELEMETRY_DISABLED: '1',
      // The tests answer /api/chat in the browser. Blank provider keys mean a
      // request that ever reaches this server fails with 401 instead of
      // calling a real model with a key from the shell.
      OPENAI_API_KEY: '',
      ANTHROPIC_API_KEY: '',
      GEMINI_API_KEY: '',
      GOOGLE_GENERATIVE_AI_API_KEY: '',
      DEEPSEEK_API_KEY: '',
    },
  },
})
