import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import babel from '@rolldown/plugin-babel'
import reactCompiler from 'babel-plugin-react-compiler'
import { defineConfig } from 'tsdown'

const ROOT = 'src'
const SOURCE = /\.tsx?$/
const TEST = /\.test\.tsx?$/

function sortedEntries(cwd: string): string[] {
  return readdirSync(resolve(cwd, ROOT), { recursive: true, encoding: 'utf8' })
    .map((file) => `${ROOT}/${file.replaceAll('\\', '/')}`)
    .filter((file) => SOURCE.test(file) && !TEST.test(file))
    .toSorted()
}

export default defineConfig(({ cwd = process.cwd() }) => ({
  entry: sortedEntries(cwd),
  root: ROOT,
  outDir: 'dist',
  platform: 'neutral',
  format: 'esm',
  unbundle: true,
  fixedExtension: false,
  dts: true,
  deps: { neverBundle: [/^node:/], onlyBundle: [] },
  checks: { moduleLevelDirective: false },
  copy: [{ from: 'src/{engines,recipes,components,styles}/**/*.css', to: 'dist', flatten: false }],
  plugins: [babel({ plugins: [[reactCompiler, { target: '19', panicThreshold: 'all_errors' }]] })],
}))
