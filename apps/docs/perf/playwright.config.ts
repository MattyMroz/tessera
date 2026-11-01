import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.LAB_PORT ?? 4380)
const ORIGIN = `http://localhost:${PORT}`
const RUN_TIMEOUT = 900_000

export default defineConfig({
  testDir: '.',
  testMatch: '*.perf.ts',
  outputDir: '../test-results/perf',
  timeout: RUN_TIMEOUT,
  workers: 1,
  fullyParallel: false,
  forbidOnly: true,
  reporter: 'list',
  use: { baseURL: ORIGIN, headless: true },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: `bun ../tests/serve.ts ${PORT}`, url: ORIGIN, reuseExistingServer: !process.env.CI },
})
