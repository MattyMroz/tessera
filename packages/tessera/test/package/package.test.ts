import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, relative, resolve } from 'node:path'
import { afterAll, beforeAll, expect, it } from 'vitest'
import type manifest from '../../package.json'
import { filesIn, packageDir } from './helpers'

type Entry = { key: string; source: string | undefined; types: string | undefined; file: string }

const RELATIVE_CSS_IMPORT = /@import\s+(["'])(\.[^"']+)\1/g
const ICON_SET = 'lucide-react'
const ICON_SPECIFIER = /["']lucide-react[/"']/g
const ICON_IMPORT = /import\s+([^'";]+?)\s+from\s*(["'])(lucide-react[^"']*)\2/g
const ICON_MODULE = /^lucide-react\/icons\/[a-z0-9-]+$/
const DEFAULT_BINDING = /^[A-Za-z_$][\w$]*$/

let sandbox = ''
let packed = ''
let contents: typeof manifest

function run(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 30_000 })
  expect(result.error).toBeUndefined()
  expect(result.status, result.stdout + result.stderr).toBe(0)
}

function expand(key: string, target: (typeof manifest.exports)[keyof typeof manifest.exports]): Entry[] {
  if (typeof target === 'string') return [{ key, source: undefined, types: undefined, file: target }]
  const types = 'types' in target ? target.types : undefined
  if (!key.includes('*')) return [{ key, source: target.source, types, file: target.default }]
  const [prefix = '', suffix = ''] = target.source.split('*')
  const directory = resolve(packageDir, prefix)
  return filesIn(directory, /\.tsx?$/)
    .filter((file) => file.endsWith(suffix) && !file.endsWith(`.test${suffix}`))
    .map((file) => relative(directory, file).replaceAll('\\', '/').slice(0, -suffix.length))
    .map((name) => ({
      key: key.replace('*', name),
      source: target.source.replace('*', name),
      types: types?.replace('*', name),
      file: target.default.replace('*', name),
    }))
}

function entries(): Entry[] {
  return Object.entries(contents.exports).flatMap(([key, target]) => {
    const expanded = expand(key, target)
    expect(expanded.length, key).toBeGreaterThan(0)
    return expanded
  })
}

beforeAll(() => {
  sandbox = mkdtempSync(resolve(tmpdir(), 'tessera-package-'))
  const archive = resolve(sandbox, 'tessera.tgz')
  packed = resolve(sandbox, 'node_modules/@mattymroz/tessera')
  mkdirSync(dirname(packed), { recursive: true })
  run('bun', ['pm', 'pack', '--filename', archive, '--quiet'], packageDir)
  run('bun', ['--eval', `
    const [archive, target] = process.argv.slice(-2);
    await new Bun.Archive(await Bun.file(archive).arrayBuffer()).extract(target);
  `, archive, resolve(sandbox, 'unpacked')], packageDir)
  renameSync(resolve(sandbox, 'unpacked/package'), packed)
  contents = JSON.parse(readFileSync(resolve(packed, 'package.json'), 'utf8'))
  for (const name of Object.keys({ ...contents.peerDependencies, ...contents.dependencies })) {
    const target = resolve(sandbox, 'node_modules', name)
    mkdirSync(dirname(target), { recursive: true })
    symlinkSync(realpathSync(resolve(packageDir, 'node_modules', name)), target, 'junction')
  }
}, 60_000)

afterAll(() => {
  if (sandbox) rmSync(sandbox, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

it('packs a manifest with CSS-only side effects and no root export', () => {
  expect(contents.name).toBe('@mattymroz/tessera')
  expect(contents.sideEffects).toEqual(['**/*.css'])
  expect(Object.keys(contents.exports)).not.toContain('.')
})

it('exports the public entry points of the package', () => {
  expect(Object.keys(contents.exports).sort()).toEqual([
    './components/*', './eslint', './lib/*', './lib/theme-script', './package.json', './tailwind.css', './tessera.css', './themes/*',
  ])
})

it('backs every export with its source file and ships the declared types and JavaScript', () => {
  const missing = entries().flatMap(({ key, source, types, file }) => [
    ...(source && !existsSync(resolve(packageDir, source)) ? [`${key} source ${source}`] : []),
    ...(types && !existsSync(resolve(packed, types)) ? [`${key} types ${types}`] : []),
    ...(!existsSync(resolve(packed, file)) ? [`${key} default ${file}`] : []),
  ])
  expect(missing).toEqual([])
})

it('declares types for every JavaScript export', () => {
  const untyped = entries().filter(({ file, types }) => file.endsWith('.js') && !types?.endsWith('.d.ts'))
  expect(untyped).toEqual([])
})

it('resolves every entry from the tarball and imports its JavaScript in a consumer', () => {
  run('node', ['--input-type=module', '--eval', `
    import assert from 'node:assert/strict';
    import { realpathSync } from 'node:fs';
    import { fileURLToPath } from 'node:url';
    import { sep } from 'node:path';
    const [root, keys] = process.argv.slice(-2);
    for (const key of JSON.parse(keys)) {
      const specifier = '@mattymroz/tessera' + key.slice(1);
      const resolved = import.meta.resolve(specifier);
      assert.ok(realpathSync(fileURLToPath(resolved)).startsWith(realpathSync(root) + sep), specifier);
      if (key.endsWith('.css')) continue;
      const module = key.endsWith('.json')
        ? await import(specifier, { with: { type: 'json' } }) : await import(specifier);
      assert.ok(Object.keys(module).length > 0, specifier);
    }
  `, packed, JSON.stringify(entries().map(({ key }) => key))], sandbox)
})

it('ships the file behind every relative CSS import of the packed stylesheets', () => {
  const imports = filesIn(resolve(packed, 'dist'), /\.css$/).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(RELATIVE_CSS_IMPORT)].map((match) => ({ file, target: resolve(dirname(file), match[2] ?? '') })),
  )
  expect(imports.length).toBeGreaterThan(0)
  const missing = imports
    .filter(({ target }) => !existsSync(target))
    .map(({ file, target }) => `${relative(packed, file)} -> ${relative(packed, target)}`.replaceAll('\\', '/'))
  expect(missing).toEqual([])
})

it('depends on the icon set with a version range', () => {
  expect(contents.dependencies[ICON_SET]).toMatch(/^\^\d+\.\d+\.\d+$/)
})

it('imports every icon of the built JavaScript by default from its own module of the icon set', () => {
  const files = filesIn(resolve(packed, 'dist'), /\.js$/).map((file) => ({
    file: relative(packed, file).replaceAll('\\', '/'),
    code: readFileSync(file, 'utf8'),
  }))
  const imports = files.flatMap(({ file, code }) =>
    [...code.matchAll(ICON_IMPORT)].map((match) => ({ file, binding: match[1] ?? '', module: match[3] ?? '' })),
  )
  expect(imports.length).toBeGreaterThan(0)
  expect(imports.filter(({ binding, module }) => !DEFAULT_BINDING.test(binding) || !ICON_MODULE.test(module))).toEqual([])
  const unmatched = files.filter(({ code }) => [...code.matchAll(ICON_SPECIFIER)].length !== [...code.matchAll(ICON_IMPORT)].length)
  expect(unmatched.map(({ file }) => file)).toEqual([])
})

it('rejects the package root and direct file paths through the package resolver', () => {
  run('node', ['--input-type=module', '--eval', `
    import assert from 'node:assert/strict';
    for (const key of JSON.parse(process.argv[1])) {
      const specifier = '@mattymroz/tessera' + key.slice(1);
      assert.throws(() => import.meta.resolve(specifier), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' }, specifier);
      await assert.rejects(import(specifier), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' }, specifier);
    }
  `, JSON.stringify(['.', './dist/lib/compose-refs.js', './src/lib/compose-refs.ts'])], sandbox)
})
