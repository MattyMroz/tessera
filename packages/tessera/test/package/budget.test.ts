import { readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { minifySync } from 'rolldown/utils'
import { expect, it } from 'vitest'
import { INSTANCE_KEYS } from '../../src/lib/instance'
import { filesIn, packageDir } from './helpers'

const PUBLIC_VARIABLE_BUDGET = 250
const COMPONENT_BYTES = 3072
const COMPONENT_BYTES_RAISED: Readonly<Record<string, number>> = { 'components/tooltip/tooltip.js': 3584 }
const V2_CSS_BYTES = 80_707
const CSS_SHARE_OF_V2 = 0.7
const GZIP_LEVEL = 9
const TAILWIND_BRIDGE = 'styles/tailwind.css'
const DECLARATION = /(?<![\w-])(--[\w-]+)\s*:/g
const REGISTRATION = /@property\s+(--[\w-]+)/g
const RELATIVE_IMPORT = /(?:\bfrom|\bimport)\s*["'](\.{1,2}\/[^"']+)["']/g

const dist = resolve(packageDir, 'dist')
const stylesheets = filesIn(dist, /\.css$/).filter((file) => relative(dist, file).replaceAll('\\', '/') !== TAILWIND_BRIDGE)
const declared = new Set(stylesheets.flatMap((file) => {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  return [...css.matchAll(DECLARATION), ...css.matchAll(REGISTRATION)].map((match) => match[1] ?? '')
}))
const publicVariables = [...declared].filter((name) => !name.startsWith('--_'))

it('prefixes every public variable declared in the built CSS with --ts-', () => {
  expect(publicVariables.filter((name) => !name.startsWith('--ts-'))).toEqual([])
})

it('counts every registered instance key as a public variable', () => {
  expect(Object.keys(INSTANCE_KEYS).filter((key) => !publicVariables.includes(key))).toEqual([])
})

it('keeps the public variables of the built CSS within the budget', () => {
  expect(publicVariables.length).toBeGreaterThan(0)
  expect(publicVariables.length).toBeLessThanOrEqual(PUBLIC_VARIABLE_BUDGET)
})

const name = (file: string): string => relative(dist, file).replaceAll('\\', '/')
const componentFiles = filesIn(resolve(dist, 'components'), /\.js$/)
const libFiles = filesIn(resolve(dist, 'lib'), /\.js$/)

function importsOf(file: string): string[] {
  return [...readFileSync(file, 'utf8').matchAll(RELATIVE_IMPORT)].map(([, specifier = '']) => resolve(dirname(file), specifier))
}

function reachedFrom(file: string, seen: Set<string> = new Set()): Set<string> {
  for (const next of importsOf(file)) {
    if (seen.has(next)) continue
    seen.add(next)
    reachedFrom(next, seen)
  }
  return seen
}

const consumers = new Map(libFiles.map((lib) => [lib, componentFiles.filter((component) => reachedFrom(component).has(lib))]))
const privateLibs = (component: string): string[] => libFiles.filter((lib) => consumers.get(lib)?.length === 1 && consumers.get(lib)?.[0] === component)

function minified(file: string): string {
  const { code, errors } = minifySync(name(file), readFileSync(file, 'utf8'))
  expect(errors, name(file)).toEqual([])
  return code
}

function gzipped(text: string): number {
  return gzipSync(text, { level: GZIP_LEVEL }).byteLength
}

it('finds the built components and lib modules it measures', () => {
  expect(componentFiles.length).toBeGreaterThan(0)
  expect(libFiles.length).toBeGreaterThan(0)
  expect([...consumers.values()].some((found) => found.length === 1)).toBe(true)
})

it.each(componentFiles.map((file) => [name(file), file] as const))('keeps the minified and gzipped %s with its private lib modules within its budget', (component, file) => {
  const parts = [file, ...privateLibs(file)]
  expect(gzipped(parts.map(minified).join('\n')), parts.map(name).join(' + ')).toBeLessThanOrEqual(COMPONENT_BYTES_RAISED[component] ?? COMPONENT_BYTES)
})

it('raises the budget only for built components', () => {
  expect(Object.keys(COMPONENT_BYTES_RAISED).filter((component) => !componentFiles.map(name).includes(component))).toEqual([])
})

it('reports the minified and gzipped size of every lib module that is not private to one component', async ({ annotate }) => {
  const shared = libFiles.filter((lib) => consumers.get(lib)?.length !== 1)
  expect(shared.length).toBeGreaterThan(0)
  for (const lib of shared) await annotate(`${name(lib)}: ${gzipped(minified(lib))} B, ${consumers.get(lib)?.length ?? 0} components`)
})

it('keeps the gzipped CSS of the package without fonts within 70 % of the v2 CSS', () => {
  const css = stylesheets.map((file) => readFileSync(file, 'utf8')).join('\n')
  expect(gzipped(css)).toBeLessThanOrEqual(Math.floor(V2_CSS_BYTES * CSS_SHARE_OF_V2))
})
