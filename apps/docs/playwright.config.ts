import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.LAB_PORT ?? 4310)
const ORIGIN = `http://localhost:${PORT}`
const ALL_BUT_ONE_CORE = 19
const RETRY_UNDER_LOAD = 1
const ONE_AT_A_TIME = 1
const NO_RETRY = 0
const RUNNER_CORES = 4
const WEBKIT_WORKERS = process.env.CI ? RUNNER_CORES / 2 : 6
const [SHARD = 0, SHARDS = 0] = (process.env.LAB_SHARD ?? '').split('/').map(Number)
const TIMED = ['budgets.spec.ts', 'button.spec.ts', 'menu.spec.ts', 'scale.spec.ts', 'switch.spec.ts', 'alert-dialog.spec.ts', 'sliding.spec.ts']
const PARALLEL = ['chromium', 'webkit']

export default defineConfig({
  testDir: 'tests',
  workers: process.env.CI ? RUNNER_CORES : ALL_BUT_ONE_CORE,
  shard: SHARDS > 0 ? { current: SHARD, total: SHARDS } : null,
  retries: RETRY_UNDER_LOAD,
  fullyParallel: false,
  forbidOnly: true,
  reporter: 'list',
  use: { baseURL: ORIGIN, headless: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: ['jump.spec.ts', ...TIMED] },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: ['budgets.spec.ts', 'a11y.spec.ts', 'jump.spec.ts', ...TIMED], workers: WEBKIT_WORKERS },
    { name: 'chromium-timed', use: { ...devices['Desktop Chrome'] }, testMatch: TIMED, workers: ONE_AT_A_TIME, retries: NO_RETRY, dependencies: PARALLEL },
    {
      name: 'webkit-timed',
      use: { ...devices['Desktop Safari'] },
      testMatch: TIMED,
      testIgnore: ['budgets.spec.ts'],
      workers: ONE_AT_A_TIME,
      retries: NO_RETRY,
      dependencies: PARALLEL,
    },
    { name: 'chromium-device-scale', use: { browserName: 'chromium', viewport: null }, testMatch: ['jump.spec.ts'], workers: ONE_AT_A_TIME, dependencies: PARALLEL },
  ],
  webServer: { command: `bun tests/serve.ts ${PORT}`, url: ORIGIN, reuseExistingServer: !process.env.CI },
})
