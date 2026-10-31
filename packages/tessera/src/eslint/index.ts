import { createRequire } from 'node:module'
import type { ESLint, Linter } from 'eslint'
import { compositorMotion } from './compositor-motion'
import { noLiteralColors } from './no-literal-colors'
import { noLocalAppearance } from './no-local-appearance'
import { noLocalCss } from './no-local-css'

export type { MotionOptions } from './compositor-motion'

// The same relative path works from src/eslint and dist/eslint; ESLint keys its cache on this version.
const { version } = createRequire(import.meta.url)('../../package.json') as { version: string }

const rules = {
  'no-local-css': noLocalCss,
  'no-local-appearance': noLocalAppearance,
  'no-literal-colors': noLiteralColors,
  'compositor-motion': compositorMotion,
}

const tessera: ESLint.Plugin & { configs: { recommended: Linter.Config[] } } = {
  meta: { name: '@mattymroz/tessera', version },
  rules,
  configs: { recommended: [] },
}

tessera.configs.recommended = [{
  name: 'tessera/recommended',
  plugins: { tessera },
  rules: Object.fromEntries(Object.keys(rules).map((name) => [`tessera/${name}`, 'error'])),
}]

export default tessera
