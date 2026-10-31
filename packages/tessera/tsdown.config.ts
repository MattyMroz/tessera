import babel from '@rolldown/plugin-babel'
import reactCompiler from 'babel-plugin-react-compiler'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}'],
  root: 'src',
  outDir: 'dist',
  platform: 'neutral',
  format: 'esm',
  unbundle: true,
  fixedExtension: false,
  dts: true,
  deps: { neverBundle: [/^node:/], onlyBundle: [] },
  checks: { moduleLevelDirective: false },
  copy: [{ from: 'src/styles/**/*.css', to: 'dist/styles' }],
  // The plugin module, not its name: Babel resolves a name from the working directory, so a build started elsewhere failed.
  plugins: [babel({ plugins: [[reactCompiler, { target: '19' }]] })],
})
