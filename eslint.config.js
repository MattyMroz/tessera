import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import tessera from './packages/tessera/dist/eslint/index.js'
import { componentAppearance } from './packages/tessera/test/guards/component-appearance.ts'

export default defineConfig([
  globalIgnores([
    '**/dist', '**/.next', '**/out', '**/node_modules', '**/test-results', '**/playwright-report', '.worktrees', '.claude', '.agents', 'tmp',
  ]),
  {
    files: ['**/*.{js,ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    name: 'tessera/components',
    files: ['packages/tessera/src/components/**/*.tsx'],
    plugins: { 'tessera-source': { rules: { 'component-appearance': componentAppearance } } },
    rules: { 'tessera-source/component-appearance': 'error' },
  },
  {
    name: 'lab/tessera-consumer',
    files: ['apps/docs/**/*.{js,mjs,ts,tsx}'],
    extends: [tessera.configs.recommended],
  },
  {
    name: 'lab/foundation-draws-engine-outputs-inline',
    files: ['apps/docs/app/foundation/page.tsx'],
    rules: { 'tessera/no-local-appearance': 'off' },
  },
  {
    name: 'lab/first-frame-probe',
    files: ['apps/docs/tests/lab.spec.ts'],
    rules: {
      'tessera/compositor-motion': [
        'error',
        { animationFrameReason: 'the anti-FOUC test reads the theme attributes in the first rendering frame' },
      ],
    },
  },
  {
    name: 'lab/tooltip-frame-probe',
    files: ['apps/docs/tests/tooltip.spec.ts'],
    rules: {
      'tessera/compositor-motion': [
        'error',
        { animationFrameReason: 'the tooltip guards read the shown tooltip in every rendering frame' },
      ],
    },
  },
  {
    name: 'lab/sliding-frame-probe',
    files: ['apps/docs/tests/sliding.spec.ts'],
    rules: {
      'tessera/compositor-motion': [
        'error',
        { animationFrameReason: 'the sliding guards read the pill and the menus in every rendering frame' },
      ],
    },
  },
])
