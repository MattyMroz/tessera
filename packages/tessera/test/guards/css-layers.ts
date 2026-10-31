import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'

export const ENGINE_GRAPH = [['color', 'type', 'motion', 'space'], ['size'], ['shape'], ['depth'], ['state', 'focus']] as const

export const ENGINES = ENGINE_GRAPH.flat()

type Engine = (typeof ENGINES)[number]

export type Violation = { file: string; line: number; rule: string; text: string }

type Block = { kind: 'at'; name: string; prelude: string } | { kind: 'rule'; selector: string }

type Node =
  | { kind: 'at'; name: string; prelude: string; block: boolean; line: number }
  | { kind: 'rule'; selector: string; line: number }
  | { kind: 'declaration'; property: string; value: string; line: number; parent: Block | undefined }
  | { kind: 'unknown'; text: string; line: number }

type Policy = { functions: ReadonlySet<string>; token: (token: string) => boolean }

type Check = (node: Node, path: string, src: string) => string | undefined

const LAYOUT = new Set([
  'display', 'gap', 'row-gap', 'column-gap', 'align-items', 'align-self', 'align-content', 'justify-content', 'justify-items',
  'justify-self', 'place-items', 'place-content', 'place-self', 'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
  'flex-basis', 'order', 'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'grid-auto-flow',
  'grid-auto-columns', 'grid-auto-rows',
])

const LAYOUT_KEYWORDS = new Set([
  'none', 'auto', 'inherit', 'initial', 'unset', 'revert', 'normal', 'flex', 'grid', 'block', 'inline', 'inline-flex',
  'inline-grid', 'contents', 'row', 'column', 'row-reverse', 'column-reverse', 'wrap', 'nowrap', 'wrap-reverse', 'center',
  'start', 'end', 'flex-start', 'flex-end', 'self-start', 'self-end', 'stretch', 'baseline', 'space-between', 'space-around',
  'space-evenly', 'dense', 'span', 'min-content', 'max-content', 'fit-content',
])

const RECIPE_KEYWORDS = new Set([
  ...LAYOUT_KEYWORDS, 'transparent', 'currentcolor', 'relative', 'absolute', 'sticky', 'fixed', 'static', 'hidden', 'visible',
  'clip', 'scroll', 'ellipsis', 'left', 'right', 'top', 'bottom', 'middle', 'isolate', 'solid', 'pointer', 'default', 'text',
  'pre', 'break-word', 'anywhere', 'border-box', 'content-box', 'cover', 'contain', 'both', 'transform', 'translate', 'scale',
  'rotate', 'opacity',
])

const COMPONENT: Policy = {
  functions: new Set(),
  token: (token) => LAYOUT_KEYWORDS.has(token) || /^(?:0|-?1|100%|[1-9]\d*fr)$/.test(token),
}

const RECIPE: Policy = { functions: new Set(['calc', 'min', 'max', 'clamp']), token: (token) => RECIPE_KEYWORDS.has(token) }

const DESCRIPTORS = new Set(['syntax', 'inherits', 'initial-value'])
const LAYER_DIRECTORIES = new Set(['engines', 'recipes', 'components'])
const ENGINE_OUTPUT = new RegExp(`^--(?:${ENGINES.join('|')})-[a-z0-9-]+$`)
const LOCAL = /^--_[a-z0-9-]+$/
const INPUT = /^--in-[a-z0-9-]+$/
const IMPORTANT = /!\s*important/i
const ROOT_OR_CHOICE = /:root|:where\(|:is\(|\)|\[data-[a-z0-9-]+(?:[~|^$*]?=(?:"[^"]*"|'[^']*'|[a-z0-9-]+))?\]|[,>\s]/g
const LAYER_IMPORT = /^(["'])([^"']+\.css)\1(?:\s+layer\([a-z-]+\))?$/

function opening(text: string): Block {
  const at = /^@([\w-]+)\s*([\s\S]*)$/.exec(text)
  return at ? { kind: 'at', name: (at[1] ?? '').toLowerCase(), prelude: (at[2] ?? '').trim() } : { kind: 'rule', selector: text }
}

function parse(css: string): Node[] {
  const nodes: Node[] = []
  const stack: Block[] = []
  let buffer = ''
  let line = 1
  let start = 1
  const flush = (end: string): void => {
    const text = buffer.trim()
    buffer = ''
    if (end === '{') {
      const block = opening(text)
      stack.push(block)
      nodes.push(block.kind === 'at' ? { ...block, block: true, line: start } : { ...block, line: start })
      return
    }
    if (!text) return
    const block = opening(text)
    if (block.kind === 'at') {
      nodes.push({ ...block, block: false, line: start })
      return
    }
    const colon = text.indexOf(':')
    if (colon <= 0) {
      nodes.push({ kind: 'unknown', text, line: start })
      return
    }
    const property = text.slice(0, colon).trim().toLowerCase()
    nodes.push({ kind: 'declaration', property, value: text.slice(colon + 1).trim(), line: start, parent: stack.at(-1) })
  }
  for (const [token] of css.matchAll(/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^]/g)) {
    if (!buffer.trim()) start = line
    line += token.split('\n').length - 1
    if (token.startsWith('/*')) continue
    if (token !== '{' && token !== ';' && token !== '}') {
      buffer += token
      continue
    }
    flush(token)
    if (token === '}') stack.pop()
  }
  flush(';')
  return nodes
}

function textOf(node: Node): string {
  if (node.kind === 'at') return `@${node.name} ${node.prelude}`.trim()
  if (node.kind === 'rule') return node.selector
  if (node.kind === 'declaration') return `${node.property}: ${node.value}`
  return node.text
}

function variables(value: string): string[] {
  return [...value.matchAll(/var\(\s*([^\s,)]+)/gi)].map((match) => match[1] ?? '')
}

function withoutVariables(value: string): { rest: string; fallback: boolean } {
  let rest = ''
  let fallback = false
  let index = 0
  for (const match of value.matchAll(/(?<![\w-])var\(/gi)) {
    if (match.index < index) continue
    let depth = 0
    let end = match.index
    for (; end < value.length; end++) {
      const char = value[end]
      if (char === '(') depth++
      else if (char === ',' && depth === 1) fallback = true
      else if (char === ')' && --depth === 0) break
    }
    rest += `${value.slice(index, match.index)} `
    index = end + 1
  }
  return { rest: rest + value.slice(index), fallback }
}

function valueProblem(value: string, policy: Policy): string | undefined {
  if (IMPORTANT.test(value)) return '!important'
  const { rest, fallback } = withoutVariables(value)
  if (fallback) return 'var() fallback'
  if (variables(value).some((name) => !ENGINE_OUTPUT.test(name) && !LOCAL.test(name))) return 'variable not allowed'
  const lower = rest.toLowerCase()
  if ([...lower.matchAll(/([a-z-]+)\(/g)].some((match) => !policy.functions.has(match[1] ?? ''))) return 'function not allowed'
  const tokens = lower
    .replace(/[a-z-]+\(/g, ' ')
    .replace(/[(),*/]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token !== '+' && token !== '-')
  return tokens.every(policy.token) ? undefined : 'literal value'
}

function inLayer(node: Node, layer: string): boolean {
  return node.kind === 'at' && node.name === 'layer' && node.block && node.prelude === layer
}

function checkComponent(node: Node): string | undefined {
  if (node.kind === 'rule') return undefined
  if (node.kind === 'at') return inLayer(node, 'components') ? undefined : 'at-rule not allowed'
  if (node.kind === 'unknown') return 'not a declaration'
  if (!LAYOUT.has(node.property)) return 'not a layout property'
  return valueProblem(node.value, COMPONENT)
}

function checkRecipe(node: Node): string | undefined {
  if (node.kind === 'rule') return undefined
  if (node.kind === 'at') return inLayer(node, 'components') ? undefined : 'at-rule not allowed'
  if (node.kind === 'unknown') return 'not a declaration'
  if (node.property.startsWith('--') && !LOCAL.test(node.property)) return 'recipes declare only --_* variables'
  return valueProblem(node.value, RECIPE)
}

function owns(engine: Engine, name: string): boolean {
  return new RegExp(`^--${engine}-[a-z0-9-]+$`).test(name) || INPUT.test(name) || LOCAL.test(name)
}

function reads(engine: Engine, name: string): boolean {
  const stage = ENGINE_GRAPH.findIndex((engines) => engines.some((candidate) => candidate === engine))
  const upstream = ENGINE_GRAPH.slice(0, stage).flat()
  return owns(engine, name) || upstream.some((dependency) => new RegExp(`^--${dependency}-[a-z0-9-]+$`).test(name))
}

function checkEngine(node: Node, engine: Engine): string | undefined {
  if (node.kind === 'unknown') return 'not a declaration'
  if (node.kind === 'rule') return node.selector && !node.selector.replace(ROOT_OR_CHOICE, '') ? undefined : 'selector not allowed'
  if (node.kind === 'at') {
    if (inLayer(node, 'theme')) return undefined
    if (node.name === 'property' && node.block) return owns(engine, node.prelude) ? undefined : 'name not owned by the engine'
    return 'at-rule not allowed'
  }
  if (node.parent?.kind === 'at' && node.parent.name === 'property') {
    return DESCRIPTORS.has(node.property) ? undefined : 'not an @property descriptor'
  }
  if (!node.property.startsWith('--')) return 'engines declare only variables'
  if (!owns(engine, node.property)) return 'name not owned by the engine'
  if (IMPORTANT.test(node.value)) return '!important'
  return variables(node.value).every((name) => reads(engine, name)) ? undefined : 'read outside the engine graph'
}

function checkStyles(node: Node, path: string, src: string): string | undefined {
  if (node.kind === 'at' && !node.block && node.name === 'layer') return undefined
  const target = node.kind === 'at' && !node.block && node.name === 'import' ? LAYER_IMPORT.exec(node.prelude)?.[2] : undefined
  const directory = target ? relative(src, resolve(dirname(path), target)).split(sep)[0] : undefined
  return directory && LAYER_DIRECTORIES.has(directory) ? undefined : 'styles hold only layer order and layer imports'
}

function isEngine(name: string | undefined): name is Engine {
  return ENGINES.some((engine) => engine === name)
}

function checkFor(parts: string[]): Check | undefined {
  const [layer, folder, ...rest] = parts
  if (layer === 'components') return checkComponent
  if (layer === 'recipes') return checkRecipe
  if (layer === 'styles' && rest.length === 0) return checkStyles
  if (layer === 'engines' && rest.length === 1 && isEngine(folder)) return (node) => checkEngine(node, folder)
  return undefined
}

function cssFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => resolve(entry.parentPath, entry.name))
}

export function checkLayers(src: string): Violation[] {
  return cssFiles(src).flatMap((path) => {
    const parts = relative(src, path).split(sep)
    const file = parts.join('/')
    const check = checkFor(parts)
    if (!check) return [{ file, line: 1, rule: 'CSS outside a layer', text: file }]
    return parse(readFileSync(path, 'utf8')).flatMap((node) => {
      const rule = check(node, path, src)
      return rule ? [{ file, line: node.line, rule, text: textOf(node) }] : []
    })
  })
}
