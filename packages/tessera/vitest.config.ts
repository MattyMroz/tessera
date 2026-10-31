import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      { extends: true, test: { name: 'unit', environment: 'node', include: ['src/**/*.test.ts', 'test/guards/**/*.test.ts'] } },
      { extends: true, test: { name: 'package', environment: 'node', include: ['test/package/**/*.test.ts'] } },
    ],
  },
})
