import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.LAB_PORT ?? 4310)
const ORIGIN = `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'tests',
  workers: 1,
  fullyParallel: false,
  forbidOnly: true,
  reporter: 'list',
  use: { baseURL: ORIGIN, headless: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: ['jump.spec.ts'] },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: ['budgets.spec.ts', 'a11y.spec.ts', 'jump.spec.ts'] },
    { name: 'chromium-device-scale', use: { browserName: 'chromium', viewport: null }, testMatch: ['jump.spec.ts'] },
  ],
  webServer: { command: `bun tests/serve.ts ${PORT}`, url: ORIGIN, reuseExistingServer: !process.env.CI },
})
