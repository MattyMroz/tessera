import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { COMPONENT_LAYOUT } from '../../src/eslint/layout'
import { INSTANCE_KEYS, type InstanceKey } from '../../src/lib/instance'
import { TONES } from '../../src/lib/tone'

const CONTAINER_WIDTHS = { narrow: 400 } as const

export const ENGINE_GRAPH = [['color', 'type', 'motion', 'space'], ['size'], ['shape'], ['depth'], ['state', 'focus']] as const

export const ENGINES = ENGINE_GRAPH.flat()

type Engine = (typeof ENGINES)[number]

export type Violation = { file: string; line: number; rule: string; text: string }

type Lists = {
  selectors: Readonly<Record<string, readonly string[]>>
  values: Readonly<Record<string, Readonly<Record<string, string>>>>
  vendor: Readonly<Record<string, string>>
}

type Block = { kind: 'at'; name: string; prelude: string } | { kind: 'rule'; selector: string }

type Node = (
  | { kind: 'at'; name: string; prelude: string; block: boolean }
  | { kind: 'rule'; selector: string }
  | { kind: 'declaration'; property: string; value: string }
  | { kind: 'unknown'; text: string }
) & { line: number; parents: readonly Block[] }

type Policy = {
  functions: ReadonlySet<string>
  token: (token: string) => boolean
  variable: (name: string) => boolean
  keyword: (token: string) => string
}

type RecipePolicies = { plain: Policy; forced: Policy; motion: Policy }

type Check = (node: Node, path: string, src: string) => string | undefined

const LITERAL = 'literal value'

const COMPONENT_PROPERTIES: ReadonlySet<string> = new Set(COMPONENT_LAYOUT)

const RECIPE_CONTAINER_PROPERTIES: ReadonlySet<string> = new Set([...COMPONENT_LAYOUT, 'text-box'])

const LAYOUT_KEYWORDS = new Set([
  'none', 'auto', 'inherit', 'initial', 'unset', 'revert', 'normal', 'flex', 'grid', 'block', 'inline', 'inline-flex',
  'inline-grid', 'contents', 'row', 'column', 'row-reverse', 'column-reverse', 'wrap', 'nowrap', 'wrap-reverse', 'center',
  'start', 'end', 'flex-start', 'flex-end', 'self-start', 'self-end', 'stretch', 'baseline', 'space-between', 'space-around',
  'space-evenly', 'dense', 'span', 'min-content', 'max-content', 'fit-content', 'subgrid',
])

const RECIPE_KEYWORDS = new Set([
  ...LAYOUT_KEYWORDS, 'transparent', 'currentcolor', 'relative', 'absolute', 'sticky', 'fixed', 'static', 'hidden', 'visible',
  'clip', 'scroll', 'ellipsis', 'left', 'right', 'top', 'bottom', 'middle', 'isolate', 'solid', 'pointer', 'default', 'text',
  'pre', 'break-word', 'anywhere', 'border-box', 'content-box', 'cover', 'contain', 'both', 'uppercase', 'linear',
  'infinite', 'thin', 'balance', 'pretty', 'tabular-nums', 'trim-both', 'trim-start', 'trim-end', 'cap', 'alphabetic', 'content',
  'inline-size', 'in', 'oklab',
])

const SYSTEM_COLORS = new Set(['canvas', 'canvastext', 'buttonface', 'buttontext', 'highlight', 'highlighttext', 'graytext'])

const COMPOSITOR_PROPERTIES = new Set(['transform', 'translate', 'scale', 'rotate', 'opacity'])

const MOTION_DECLARATIONS = new Set(['transition', 'transition-property', 'will-change'])

const MATH_FUNCTIONS = new Set(['calc', 'min', 'max', 'clamp'])

const RECIPE_FUNCTIONS = new Set([...MATH_FUNCTIONS, 'color-mix'])

const SMALL_NUMBER = /^(?:0|-?1|100%)$/

const NUMBER = /(?<![\w.-])-?(?:\d+\.?\d*|\.\d+)[a-z%]*/g

const EMPTY_STRING = /^(?:''|"")$/

const COMPONENT_VARIABLE = /^--ts-(?:space-[a-z0-9-]+|size-(?:label-)?gap)$/

const COMPONENT: Policy = {
  functions: new Set(),
  token: (token) => LAYOUT_KEYWORDS.has(token) || SMALL_NUMBER.test(token) || /^[1-9]\d*fr$/.test(token),
  variable: (name) => COMPONENT_VARIABLE.test(name),
  keyword: () => LITERAL,
}

const PROPERTY_DESCRIPTORS = new Set(['syntax', 'inherits', 'initial-value'])
const FONT_DESCRIPTORS = new Set([
  'font-family', 'src', 'font-weight', 'font-style', 'font-display', 'size-adjust', 'ascent-override', 'descent-override',
  'line-gap-override', 'unicode-range',
])
const ENGINE_SUPPORTS = new Set(['(corner-shape: superellipse(2))'])
const ENGINE_MEDIA = new Set(['(prefers-reduced-motion: reduce)', '(pointer: coarse)', '(prefers-contrast: more)'])
const FORCED_COLORS = '(forced-colors: active)'
const RECIPE_MEDIA = new Set(['(hover: hover)', FORCED_COLORS])
const CLIP_SUPPORTS = '(overflow-clip-margin: border-box)'
const RECIPE_SUPPORTS: Readonly<Record<string, readonly string[]>> = { control: [CLIP_SUPPORTS] }
const CLIP_PROPERTIES = new Set(['overflow', 'overflow-clip-margin'])
const KEYFRAMES = new Set(['ts-spin', 'ts-sweep', 'ts-pulse'])
const KEYFRAME_SELECTOR = /^(?:from|to|\d+(?:\.\d+)?%)$/
const CONTAINER_CONDITION = /^\(inline-size(?:<|>=)(\d+)px\)$/
const CONTAINER_NAMES: ReadonlyMap<number, string> = new Map(Object.entries(CONTAINER_WIDTHS).map(([name, width]) => [width, name]))
const INSTANCE_NAMES: ReadonlySet<string> = new Set(Object.keys(INSTANCE_KEYS))
const COLOR_MIX_SPACE = /(?<![\w-])color-mix\(([^,)]*)/gi
const COLOR_SPACE = 'in oklab'
const FONT_IMPORTS = new Set(['@fontsource-variable/inter/wght.css', '@fontsource-variable/cascadia-code/wght.css'])
const LAYER_DIRECTORIES = new Set(['engines', 'recipes', 'components'])
const LAYER_ORDER = 'theme, base, components, utilities'
const ENTRY = 'styles/tessera.css'
const ENGINE_OUTPUT = new RegExp(`^--ts-(?:${ENGINES.join('|')})-[a-z0-9-]+$`)
const BRIDGE_VALUE = new RegExp(`^var\\(--ts-(?:${ENGINES.join('|')})-[a-z0-9-]+\\)$`)
const PART_LOCAL = /^--_(?!ts-)[a-z0-9-]+$/
const IMPORTANT = /!\s*important/i
const ENGINE_SELECTOR = /:root|:where\(|:is\(|:not\(|\)|\[data-[a-z0-9-]+(?:[~|^$*]?=(?:"[^"]*"|'[^']*'|[a-z0-9-]+))?\]|[,>\s]/g
const COMPONENT_SELECTOR = /:focus-visible|\*(?!=)/i
const IMPORT = /^(["'])([^"']+)\1$/
const VENDOR_PREFIX = /^-(?:webkit|moz|ms|o)-/
const SIBLING_COMBINATOR = /[~+]/
const PAGE_ROOT = /:root(?![\w-])|(?<![\w-])(?:html|body)(?![\w-])/i
const ROOT = /:root(?![\w-])/
const SLOT = /\[data-slot[~|^$*]?=/
const ANY_TONE = /\[data-tone[\]~|^$*=]/
const RAISED = /\[data-variant=(["']?)raised\1\]/
const INSET_SHADOW = /(?<![\w-])inset(?![\w-])/i
const ICON_GLYPH = "[data-recipe='control'] > [data-slot='icon'] > svg"
const BUSY_GLYPH = "[data-recipe='control'] > [data-slot='busy'] > svg"
const DOT_GLYPH = "[data-recipe='control'] > [data-slot='icon'][data-dot] > svg"
const MARK_GLYPH = "[data-recipe='control'] > [data-slot='mark'] > svg"
const LISTBOX_CHEVRON = "[data-recipe='control'][aria-haspopup='listbox'] > [data-slot='icon']:last-child > svg"
const LISTBOX_CHEVRON_OPEN = "[data-recipe='control'][aria-haspopup='listbox'][data-popup-open] > [data-slot='icon']:last-child > svg"
const MARK_DRAWING = "[data-recipe='indicator'][data-variant='check'] > svg"
const MARK_CHECKED = ":is([aria-checked='true'], [aria-selected='true']) > [data-recipe='indicator'][data-variant='check'] > svg:first-child"
const MARK_MIXED = "[aria-checked='mixed'] > [data-recipe='indicator'][data-variant='check'] > svg:last-child"
const ROW_MARK_GLYPH = "[data-recipe='row'] > [data-slot='mark'] > svg"
const CHOICE_HOST = "[data-slot='choice']:has(> [data-recipe='control'])"
const ROW_ICON_GLYPH = "[data-recipe='row'] [data-slot='icon'] > svg"
const SURFACE_ICON_GLYPH = "[data-recipe='surface'] > [data-slot='icon'] > svg"
const INDICATOR_HOST = ":has(> [data-recipe='indicator'])"
const INDICATOR_REPLACES_CONTROL_INK = "[data-recipe='indicator'] ~ [data-recipe='control']::before"
const INDICATOR_CHOICE_LABEL = "[data-recipe='indicator'] ~ [data-recipe='control'][aria-checked='true']:not(:disabled, [data-disabled])"
const PAGE_SCROLLER = ":root:has(> [data-recipe='surface'][data-variant='page'])"
const POSITIONER_LAYERS = ["[data-side]:has(> [data-recipe='surface'][data-level='overlay'])"]
const RECIPE_SELECTOR_EXCEPTIONS: Readonly<Record<string, readonly string[]>> = {
  control: [ICON_GLYPH, BUSY_GLYPH, DOT_GLYPH, MARK_GLYPH, LISTBOX_CHEVRON, LISTBOX_CHEVRON_OPEN, CHOICE_HOST],
  indicator: [INDICATOR_HOST, INDICATOR_REPLACES_CONTROL_INK, INDICATOR_CHOICE_LABEL, MARK_DRAWING, MARK_CHECKED, MARK_MIXED],
  row: [ROW_ICON_GLYPH, ROW_MARK_GLYPH],
  surface: [...POSITIONER_LAYERS, SURFACE_ICON_GLYPH, PAGE_SCROLLER],
}
const ARIA_LEVEL_INDENT: Readonly<Record<string, string>> = {
  "[data-recipe='row'][aria-level]": '--_level: 7',
  "[data-recipe='row'][aria-level='1']": '--_level: 0',
  "[data-recipe='row'][aria-level='2']": '--_level: 1',
  "[data-recipe='row'][aria-level='3']": '--_level: 2',
  "[data-recipe='row'][aria-level='4']": '--_level: 3',
  "[data-recipe='row'][aria-level='5']": '--_level: 4',
  "[data-recipe='row'][aria-level='6']": '--_level: 5',
  "[data-recipe='row'][aria-level='7']": '--_level: 6',
}
const VENDOR_VARIABLES: Readonly<Record<string, string>> = {
  '--available-height': 'Base UI measures the room left in the viewport, so the popup fits in the window',
  '--available-width': 'Base UI measures the room left in the viewport, so the popup fits in the window',
  '--anchor-width': 'a popup with data-width="trigger" is at least as wide as its trigger',
}

const HOVER_EXIT_FADE = 'background-color var(--ts-motion-duration-hover-out) var(--ts-motion-ease-hover)'
const HOVER_EXIT_REST = ":not(:hover, [data-pressing], [aria-expanded='true'], [data-popup-open], [aria-pressed='true'], [aria-selected='true'])::before"
const HOVER_EXIT_PLATE = `[data-recipe='control']:where(button:not([role]), [role='button'], [data-slot='box'], [data-slot='track'], a[href]:not([role]), [aria-haspopup='listbox'], [data-variant='field'])${HOVER_EXIT_REST}`
const HOVER_EXIT_ANCHOR_PLATE = `[data-recipe='control']:where(button:not([role]), [role='button'], [data-slot='box'], a[href]:not([role])):not(:disabled, [data-disabled], [aria-disabled='true'], [aria-busy='true'], [data-variant='field'], [aria-haspopup='listbox'], [data-surface='joined'] > *):is([aria-haspopup], [aria-expanded], [data-popup-open], [data-tooltip-trigger])${HOVER_EXIT_REST}`
const HOVER_EXIT: Readonly<Record<string, string>> = {
  [HOVER_EXIT_PLATE]: `transition: ${HOVER_EXIT_FADE}`,
  [HOVER_EXIT_ANCHOR_PLATE]: `transition: scale var(--ts-motion-duration-press-out) var(--ts-motion-ease-press-out), ${HOVER_EXIT_FADE}`,
}

const MARK_DRAW: Readonly<Record<string, string>> = {
  [MARK_DRAWING]: 'transition: stroke-dashoffset var(--ts-motion-duration-draw-out) var(--ts-motion-ease-draw)',
}
const TIP = "[data-recipe='surface'][data-variant='tooltip']"
const TIP_GLIDE = 'translate var(--ts-motion-duration-follow) var(--ts-motion-ease-out), width var(--ts-motion-duration-follow) var(--ts-motion-ease-out)'
const TIP_MOTION: Readonly<Record<string, string>> = {
  [TIP]: `transition: opacity var(--ts-motion-duration-press-in) var(--ts-motion-ease-out), ${TIP_GLIDE}`,
  [`${TIP}[data-open]`]: `transition: opacity var(--ts-motion-duration-hover-out) var(--ts-motion-ease-out), ${TIP_GLIDE}`,
  [`${TIP} [data-slot='label']`]: 'transition: opacity var(--ts-motion-duration-follow) var(--ts-motion-ease-out), filter var(--ts-motion-duration-follow) var(--ts-motion-ease-out)',
}
const SOURCE_LISTS: Lists = {
  selectors: RECIPE_SELECTOR_EXCEPTIONS,
  values: { row: ARIA_LEVEL_INDENT, control: { ...HOVER_EXIT, [CHOICE_HOST]: 'contain: layout' }, indicator: MARK_DRAW, surface: TIP_MOTION },
  vendor: VENDOR_VARIABLES,
}

type Scope = {
  owner: 'recipe' | 'component'
  test: RegExp
  exceptions: ReadonlySet<string>
  values: Readonly<Record<string, string>>
  supports: ReadonlySet<string>
  unused: Set<string>
  unusedValues: Set<string>
  unusedSupports: Set<string>
}

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
    const parents = [...stack]
    if (end === '{') {
      const block = opening(text)
      stack.push(block)
      nodes.push(block.kind === 'at' ? { ...block, block: true, line: start, parents } : { ...block, line: start, parents })
      return
    }
    if (!text) return
    const block = opening(text)
    if (block.kind === 'at') {
      nodes.push({ ...block, block: false, line: start, parents })
      return
    }
    const colon = text.indexOf(':')
    if (colon <= 0) {
      nodes.push({ kind: 'unknown', text, line: start, parents })
      return
    }
    const property = text.slice(0, colon).trim().toLowerCase()
    nodes.push({ kind: 'declaration', property, value: text.slice(colon + 1).trim(), line: start, parents })
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

function parseFile(path: string): Node[] {
  return existsSync(path) ? parse(readFileSync(path, 'utf8')) : []
}

function textOf(node: Node): string {
  if (node.kind === 'at') return `@${node.name} ${node.prelude}`.trim()
  if (node.kind === 'rule') return node.selector
  if (node.kind === 'declaration') return `${node.property}: ${node.value}`
  return node.text
}

function condition(prelude: string): string {
  return prelude.replace(/\s+/g, ' ')
}

function isAt(block: Block | Node | undefined, name: string, prelude?: string): boolean {
  return block?.kind === 'at' && block.name === name && (prelude === undefined || block.prelude === prelude)
}

function topBlock(node: Node, name: string, prelude?: string): boolean {
  return node.kind === 'at' && node.block && node.parents.length === 0 && isAt(node, name, prelude)
}

function within(node: Node, layer: string): boolean {
  return node.parents.some((block) => isAt(block, 'layer', layer))
}

function forcedColors(node: Node): boolean {
  return node.parents.some((block) => block.kind === 'at' && block.name === 'media' && condition(block.prelude) === FORCED_COLORS)
}

function containerWidth(prelude: string): string | undefined {
  const match = CONTAINER_CONDITION.exec(prelude.replace(/\s+/g, ''))
  return match ? CONTAINER_NAMES.get(Number(match[1])) : undefined
}

function containerProblem(prelude: string): string | undefined {
  return containerWidth(prelude) === undefined ? 'container condition outside CONTAINER_WIDTHS' : undefined
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

function mathExpressions(value: string): string[] {
  const expressions: string[] = []
  let index = 0
  for (const match of value.matchAll(/(?<![\w-])(?:calc|min|max|clamp)\(/g)) {
    if (match.index < index) continue
    let depth = 0
    let end = match.index
    for (; end < value.length; end++) {
      if (value[end] === '(') depth++
      else if (value[end] === ')' && --depth === 0) break
    }
    expressions.push(value.slice(match.index, end + 1))
    index = end + 1
  }
  return expressions
}

function valueProblem(value: string, policy: Policy): string | undefined {
  if (IMPORTANT.test(value)) return '!important'
  const { rest, fallback } = withoutVariables(value)
  if (fallback) return 'var() fallback'
  if (!variables(value).every(policy.variable)) return 'variable not allowed'
  const lower = rest.toLowerCase()
  if ([...lower.matchAll(/([a-z-]+)\(/g)].some((match) => !policy.functions.has(match[1] ?? ''))) return 'function not allowed'
  if (mathExpressions(lower).some((expression) => (expression.match(NUMBER) ?? []).length > 1)) {
    return 'more than one literal in an expression'
  }
  const tokens = lower
    .replace(/[a-z-]+\(/g, ' ')
    .replace(/[(),*/]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token !== '+' && token !== '-')
  const wrong = tokens.find((token) => !policy.token(token))
  if (wrong === undefined) return undefined
  return /^[a-z-]+$/.test(wrong) ? policy.keyword(wrong) : LITERAL
}

function colorSpaceProblem(value: string): string | undefined {
  const spaces = [...value.matchAll(COLOR_MIX_SPACE)].map((match) => condition((match[1] ?? '').trim().toLowerCase()))
  return spaces.every((space) => space === COLOR_SPACE) ? undefined : 'color-mix outside in oklab'
}

function recipePolicies(vendor: Readonly<Record<string, string>>): RecipePolicies {
  const plain: Policy = {
    functions: RECIPE_FUNCTIONS,
    token: (token) => RECIPE_KEYWORDS.has(token) || SMALL_NUMBER.test(token),
    variable: (name) => ENGINE_OUTPUT.test(name) || PART_LOCAL.test(name) || INSTANCE_NAMES.has(name) || Object.hasOwn(vendor, name),
    keyword: (token) => (SYSTEM_COLORS.has(token) ? `system color outside @media ${FORCED_COLORS}` : LITERAL),
  }
  return {
    plain,
    forced: { ...plain, token: (token) => plain.token(token) || SYSTEM_COLORS.has(token) },
    motion: {
      functions: MATH_FUNCTIONS,
      token: (token) => COMPOSITOR_PROPERTIES.has(token),
      variable: (name) => ENGINE_OUTPUT.test(name),
      keyword: () => 'motion of a non-compositor property',
    },
  }
}

function checkComponent(node: Node, scope: Scope): string | undefined {
  if (node.kind === 'rule') {
    if (COMPONENT_SELECTOR.test(node.selector)) return 'selector not allowed'
    return within(node, 'components') ? selectorProblem(node, scope) : 'rule outside @layer components'
  }
  if (node.kind === 'at') {
    if (topBlock(node, 'layer', 'components')) return undefined
    return node.block && node.name === 'container' && within(node, 'components') ? containerProblem(node.prelude) : 'at-rule not allowed'
  }
  if (node.kind === 'unknown') return 'not a declaration'
  if (VENDOR_PREFIX.test(node.property)) return 'vendor-prefixed property'
  if (!COMPONENT_PROPERTIES.has(node.property)) return 'not a layout property'
  return valueProblem(node.value, COMPONENT)
}

function nest(parent: string, part: string): string {
  if (!parent) return part
  return part.includes('&') ? part.replaceAll('&', parent) : `${parent} ${part}`
}

function selectorsOf(blocks: readonly Block[]): string[] {
  return blocks
    .flatMap((block) => (block.kind === 'rule' ? [block.selector] : []))
    .reduce<string[]>((parents, selector) => parents.flatMap((parent) => selectorList(selector).map((part) => nest(parent, part.trim()))), [''])
    .map((selector) => selector.replace(/\s+/g, ' ').trim())
}

function resolvedSelectors(node: Node & { kind: 'rule' }): string[] {
  return selectorsOf([...node.parents, { kind: 'rule', selector: node.selector }])
}

function compounds(selector: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < selector.length; index++) {
    const char = selector[index] ?? ''
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth--
    else if (depth === 0 && /[\s>~+]/.test(char)) {
      parts.push(selector.slice(start, index))
      start = index + 1
    }
  }
  return [...parts, selector.slice(start)].filter(Boolean)
}

function withoutArguments(text: string): string {
  let result = ''
  let depth = 0
  for (const char of text) {
    if (char === ')') depth--
    if (depth === 0) result += char
    if (char === '(') depth++
  }
  return result
}

function selectorProblem(node: Node & { kind: 'rule' }, scope: Scope): string | undefined {
  for (const selector of resolvedSelectors(node)) {
    if (scope.exceptions.has(selector)) {
      scope.unused.delete(selector)
      continue
    }
    const bare = selector.replace(/'[^']*'|"[^"]*"/g, '').replace(/\[[^\]]*\]/g, '[]')
    if (SIBLING_COMBINATOR.test(bare)) return 'sibling combinator in a selector'
    if (PAGE_ROOT.test(bare)) return 'page root in a selector'
    const outer = compounds(selector).map(withoutArguments)
    const subject = outer.at(-1) ?? ''
    const ownSlot = SLOT.test(subject) && outer.slice(0, -1).some((compound) => scope.test.test(compound))
    if (!scope.test.test(subject) && !ownSlot) return `selector outside the ${scope.owner}`
  }
  return undefined
}

function selectorList(selector: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < selector.length; index++) {
    const char = selector[index]
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth--
    else if (char === ',' && depth === 0) {
      parts.push(selector.slice(start, index))
      start = index + 1
    }
  }
  return [...parts, selector.slice(start)]
}

function recipeScope(name: string): Scope {
  const exceptions = SOURCE_LISTS.selectors[name] ?? []
  const values = SOURCE_LISTS.values[name] ?? {}
  const supports = RECIPE_SUPPORTS[name] ?? []
  return {
    owner: 'recipe',
    test: new RegExp(`\\[data-recipe=(["'])${name}\\1\\]|\\[data-${name}[\\]=]`),
    exceptions: new Set(exceptions),
    values,
    supports: new Set(supports),
    unused: new Set(exceptions),
    unusedValues: new Set(Object.keys(values)),
    unusedSupports: new Set(supports),
  }
}

function componentScope(name: string): Scope {
  return {
    owner: 'component',
    test: new RegExp(`\\[data-component=(["'])${name}\\1\\]`),
    exceptions: new Set(),
    values: {},
    supports: new Set(),
    unused: new Set(),
    unusedValues: new Set(),
    unusedSupports: new Set(),
  }
}

function valueException(node: Node, values: Readonly<Record<string, string>>): string[] | undefined {
  if (node.kind !== 'declaration') return undefined
  const selectors = selectorsOf(node.parents)
  const declaration = `${node.property}: ${node.value}`
  return selectors.every((selector) => Object.hasOwn(values, selector) && values[selector] === declaration) ? selectors : undefined
}

function literalLocals(recipes: readonly { name: string; nodes: readonly Node[] }[]): ReadonlySet<string> {
  const definitions = recipes.flatMap(({ name, nodes }) =>
    nodes.flatMap((node) =>
      node.kind === 'declaration' && PART_LOCAL.test(node.property) && !valueException(node, SOURCE_LISTS.values[name] ?? {}) ? [node] : [],
    ),
  )
  const literal = new Set<string>()
  let grown = true
  while (grown) {
    grown = false
    for (const { property, value } of definitions) {
      if (literal.has(property)) continue
      if (!withoutVariables(value).rest.match(NUMBER) && !variables(value).some((name) => literal.has(name))) continue
      literal.add(property)
      grown = true
    }
  }
  return literal
}

function arithmeticProblem(value: string, literal: ReadonlySet<string>): string | undefined {
  const reads = mathExpressions(value.toLowerCase()).some((expression) => variables(expression).some((name) => literal.has(name)))
  return reads ? 'arithmetic on a --_* variable built from a literal' : undefined
}

type RecipeContext = { literal: ReadonlySet<string>; policies: RecipePolicies; vendor: Readonly<Record<string, string>>; usedVendor: Set<string> }

function checkRecipeAt(node: Node & { kind: 'at' }, scope: Scope): string | undefined {
  if (topBlock(node, 'layer', 'components')) return undefined
  if (!node.block || !within(node, 'components')) return 'at-rule not allowed'
  if (node.name === 'container') return containerProblem(node.prelude)
  if (node.name === 'supports') return scope.supports.has(condition(node.prelude)) ? undefined : 'at-rule not allowed'
  return node.name === 'media' && RECIPE_MEDIA.has(condition(node.prelude)) ? undefined : 'at-rule not allowed'
}

function supportsProblem(node: Node & { kind: 'declaration' }, scope: Scope): string | undefined {
  const supports = node.parents.find((block) => isAt(block, 'supports'))
  if (supports?.kind !== 'at') return undefined
  if (!CLIP_PROPERTIES.has(node.property)) return 'not a clip property in @supports'
  scope.unusedSupports.delete(condition(supports.prelude))
  return undefined
}

function checkRecipe(node: Node, scope: Scope, context: RecipeContext): string | undefined {
  if (node.kind === 'rule') return within(node, 'components') ? selectorProblem(node, scope) : 'rule outside @layer components'
  if (node.kind === 'at') return checkRecipeAt(node, scope)
  if (node.kind === 'unknown') return 'not a declaration'
  if (VENDOR_PREFIX.test(node.property)) return 'vendor-prefixed property'
  const excepted = valueException(node, scope.values)
  if (excepted) {
    for (const selector of excepted) scope.unusedValues.delete(selector)
    return undefined
  }
  if (node.property.startsWith('--') && !PART_LOCAL.test(node.property)) return 'recipes declare only --_* variables'
  if (node.parents.some((block) => isAt(block, 'container')) && !RECIPE_CONTAINER_PROPERTIES.has(node.property)) {
    return 'not a layout property in @container'
  }
  const clip = supportsProblem(node, scope)
  if (clip) return clip
  for (const name of variables(node.value)) if (Object.hasOwn(context.vendor, name)) context.usedVendor.add(name)
  if (node.property === 'content' && EMPTY_STRING.test(node.value)) return undefined
  const { motion, forced, plain } = context.policies
  const policy = MOTION_DECLARATIONS.has(node.property) ? motion : forcedColors(node) ? forced : plain
  return colorSpaceProblem(node.value) ?? valueProblem(node.value, policy) ?? arithmeticProblem(node.value, context.literal)
}

function owns(engine: Engine, name: string): boolean {
  return new RegExp(`^(?:--ts-|--ts-in-|--_ts-)${engine}-[a-z0-9-]+$`).test(name)
}

function reads(engine: Engine, name: string): boolean {
  const stage = ENGINE_GRAPH.findIndex((engines) => engines.some((candidate) => candidate === engine))
  const upstream = ENGINE_GRAPH.slice(0, stage).flat()
  return owns(engine, name) || upstream.some((dependency) => new RegExp(`^--ts-${dependency}-[a-z0-9-]+$`).test(name))
}

function registers(engine: Engine, name: string): boolean {
  return owns(engine, name) || (engine === 'size' && INSTANCE_NAMES.has(name))
}

function keyframesProblem(engine: Engine, name: string): string | undefined {
  if (engine !== 'motion') return '@keyframes outside the motion engine'
  return KEYFRAMES.has(name) ? undefined : 'keyframes name not listed'
}

function checkEngineAt(node: Node & { kind: 'at' }, engine: Engine): string | undefined {
  if (topBlock(node, 'layer', 'theme')) return undefined
  if (topBlock(node, 'property')) return registers(engine, node.prelude) ? undefined : 'name not owned by the engine'
  if (topBlock(node, 'font-face')) return engine === 'type' ? undefined : '@font-face outside the type engine'
  if (topBlock(node, 'keyframes')) return keyframesProblem(engine, node.prelude)
  const conditions = node.name === 'supports' ? ENGINE_SUPPORTS : node.name === 'media' ? ENGINE_MEDIA : undefined
  return node.block && conditions?.has(condition(node.prelude)) && within(node, 'theme') ? undefined : 'at-rule not allowed'
}

function checkKeyframe(node: Node & { kind: 'declaration' }, engine: Engine): string | undefined {
  if (!COMPOSITOR_PROPERTIES.has(node.property)) return 'non-compositor property in @keyframes'
  if (IMPORTANT.test(node.value)) return '!important'
  return variables(node.value).every((name) => reads(engine, name)) ? undefined : 'read outside the engine graph'
}

function checkEngine(node: Node, engine: Engine): string | undefined {
  if (node.kind === 'unknown') return 'not a declaration'
  if (node.kind === 'at') return checkEngineAt(node, engine)
  const parent = node.parents.at(-1)
  if (node.kind === 'rule') {
    if (isAt(parent, 'keyframes')) {
      return selectorList(node.selector).every((selector) => KEYFRAME_SELECTOR.test(selector.trim())) ? undefined : 'keyframe selector not allowed'
    }
    if (!node.selector || node.selector.replace(ENGINE_SELECTOR, '')) return 'selector not allowed'
    return within(node, 'theme') ? undefined : 'rule outside @layer theme'
  }
  if (parent?.kind === 'rule' && isAt(node.parents.at(-2), 'keyframes')) return checkKeyframe(node, engine)
  if (isAt(parent, 'property')) return PROPERTY_DESCRIPTORS.has(node.property) ? undefined : 'not an @property descriptor'
  if (isAt(parent, 'font-face')) return FONT_DESCRIPTORS.has(node.property) ? undefined : 'not a @font-face descriptor'
  if (!node.property.startsWith('--')) return 'engines declare only variables'
  if (!owns(engine, node.property)) return 'name not owned by the engine'
  if (IMPORTANT.test(node.value)) return '!important'
  return variables(node.value).every((name) => reads(engine, name)) ? undefined : 'read outside the engine graph'
}

function isLayerOrder(node: Node | undefined): boolean {
  if (node?.kind !== 'at' || node.block || node.name !== 'layer') return false
  return node.prelude.split(',').map((layer) => layer.trim()).join(', ') === LAYER_ORDER
}

function importTarget(node: Node): string | undefined {
  return node.kind === 'at' && !node.block && node.name === 'import' ? IMPORT.exec(node.prelude)?.[2] : undefined
}

function sourcePath(src: string, path: string): string {
  return relative(src, path).split(sep).join('/')
}

function checkEntry(node: Node, path: string, src: string): string | undefined {
  if (node.kind === 'at' && !node.block && node.name === 'layer') {
    return isLayerOrder(node) ? undefined : `layer order is ${LAYER_ORDER}`
  }
  const target = importTarget(node)
  if (target && FONT_IMPORTS.has(target)) return undefined
  const local = target?.startsWith('.') && target.endsWith('.css') ? target : undefined
  const directory = local ? sourcePath(src, resolve(dirname(path), local)).split('/')[0] : undefined
  return directory && LAYER_DIRECTORIES.has(directory) ? undefined : 'tessera.css holds only layer order and imports'
}

function checkEntryCompleteness(src: string, layered: readonly string[]): Violation[] {
  const path = resolve(src, ENTRY)
  const nodes = parseFile(path)
  const imported = new Set(nodes.flatMap((node) => {
    const target = importTarget(node)
    return target?.startsWith('.') ? [sourcePath(src, resolve(dirname(path), target))] : []
  }))
  const order = isLayerOrder(nodes[0]) ? [] : [{ file: ENTRY, line: 1, rule: 'tessera.css opens with the layer order', text: LAYER_ORDER }]
  const missing = layered.filter((file) => !imported.has(file)).map((file) => ({ file: ENTRY, line: 1, rule: 'import missing from tessera.css', text: file }))
  return [...order, ...missing]
}

function checkBridge(node: Node): string | undefined {
  if (topBlock(node, 'theme', 'inline')) return undefined
  const bridge = node.kind === 'declaration' && node.parents.length === 1 && isAt(node.parents[0], 'theme', 'inline')
  return bridge && node.property.startsWith('--') && BRIDGE_VALUE.test(node.value) ? undefined : 'tailwind.css holds only @theme inline bridges'
}

function isEngine(name: string | undefined): name is Engine {
  return ENGINES.some((engine) => engine === name)
}

function checkFor(parts: string[], context: RecipeContext): { check: Check; scope?: Scope } | undefined {
  const [layer, name, ...rest] = parts
  const own = basename(parts.at(-1) ?? '', '.css')
  if (layer === 'components') {
    const scope = componentScope(own)
    return { check: (node) => checkComponent(node, scope), scope }
  }
  if (layer === 'recipes') {
    const scope = recipeScope(own)
    return { check: (node) => checkRecipe(node, scope, context), scope }
  }
  if (rest.length > 0) return undefined
  if (layer === 'styles' && name === 'tessera.css') return { check: checkEntry }
  if (layer === 'styles' && name === 'tailwind.css') return { check: checkBridge }
  const engine = name?.replace(/\.css$/, '')
  if (layer === 'engines' && isEngine(engine)) return { check: (node) => checkEngine(node, engine) }
  return undefined
}

function cssFiles(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => resolve(entry.parentPath, entry.name))
}

export function checkLayers(src: string): Violation[] {
  const layered: string[] = []
  const files = cssFiles(src).map((path) => ({ path, parts: relative(src, path).split(sep), nodes: parse(readFileSync(path, 'utf8')) }))
  const recipes = files.flatMap(({ parts, nodes }) => (parts[0] === 'recipes' ? [{ name: basename(parts.at(-1) ?? '', '.css'), nodes }] : []))
  const context: RecipeContext = {
    literal: literalLocals(recipes),
    policies: recipePolicies(SOURCE_LISTS.vendor),
    vendor: SOURCE_LISTS.vendor,
    usedVendor: new Set(),
  }
  const violations = files.flatMap(({ path, parts, nodes }) => {
    const file = parts.join('/')
    const layer = checkFor(parts, context)
    if (!layer) return [{ file, line: 1, rule: 'CSS outside a layer', text: file }]
    if (LAYER_DIRECTORIES.has(parts[0] ?? '')) layered.push(file)
    const found = nodes.flatMap((node) => {
      const rule = layer.check(node, path, src)
      return rule ? [{ file, line: node.line, rule, text: textOf(node) }] : []
    })
    const unused = [...(layer.scope?.unused ?? [])].map((text) => ({ file, line: 1, rule: 'unused selector exception', text }))
    const unusedValues = [...(layer.scope?.unusedValues ?? [])].map((text) => ({ file, line: 1, rule: 'unused value exception', text }))
    const unusedSupports = [...(layer.scope?.unusedSupports ?? [])].map((text) => ({ file, line: 1, rule: 'unused supports condition', text }))
    return [...found, ...unused, ...unusedValues, ...unusedSupports]
  })
  const unusedVendor = Object.keys(SOURCE_LISTS.vendor)
    .filter((name) => !context.usedVendor.has(name))
    .map((text) => ({ file: 'recipes', line: 1, rule: 'unused vendor variable', text }))
  return [...violations, ...unusedVendor, ...checkEntryCompleteness(src, layered)]
}

function ruleSelectors(nodes: readonly Node[]): string[] {
  return nodes.flatMap((node) => (node.kind === 'rule' ? resolvedSelectors(node) : []))
}

function attribute(name: string, value: string): RegExp {
  return new RegExp(`\\[data-${name}=(["']?)${value}\\1\\]`)
}

function outlines(property: string, value: string): boolean {
  if (property.startsWith('border') || property.startsWith('outline')) return true
  if (property === '--_border') return value !== 'transparent'
  return INSET_SHADOW.test(value)
}

export function toneProblems(src: string): string[] {
  const recipe = (name: string): Node[] => parseFile(resolve(src, 'recipes', `${name}.css`))
  const missing = (name: string, selectors: readonly string[]): string[] =>
    TONES.filter((tone) => !selectors.some((selector) => attribute('tone', tone).test(selector))).map((tone) => `${name}: no rule for data-tone='${tone}'`)
  const control = ruleSelectors(recipe('control'))
  const surface = recipe('surface')
  const raised = control.some((selector) => RAISED.test(selector) && ANY_TONE.test(selector)) ? [] : ['control: no rule for raised with a tone']
  const outlined = surface.flatMap((node) =>
    node.kind === 'declaration' && outlines(node.property, node.value) && selectorsOf(node.parents).some((selector) => ANY_TONE.test(selector))
      ? [`surface: ${node.property} in a tone rule`]
      : [],
  )
  return [
    ...missing('control', control),
    ...raised,
    ...missing('row', ruleSelectors(recipe('row'))),
    ...missing('surface', ruleSelectors(surface)),
    ...outlined,
  ]
}

export function containerWidthProblems(src: string): string[] {
  const used = new Set(
    cssFiles(src)
      .filter((path) => ['recipes', 'components'].includes(relative(src, path).split(sep)[0] ?? ''))
      .flatMap((path) => parseFile(path))
      .flatMap((node) => (node.kind === 'at' && node.name === 'container' ? [containerWidth(node.prelude) ?? ''] : [])),
  )
  return Object.keys(CONTAINER_WIDTHS).filter((name) => !used.has(name)).map((name) => `unused container width: ${name}`)
}

export function instanceRegistryProblems(src: string): string[] {
  const descriptors = new Map<string, Map<string, string>>()
  for (const node of parseFile(resolve(src, 'engines/size.css'))) {
    if (node.kind === 'at' && topBlock(node, 'property') && node.prelude.startsWith('--ts-i-')) descriptors.set(node.prelude, new Map())
    const owner = node.parents[0]
    if (node.kind === 'declaration' && node.parents.length === 1 && owner?.kind === 'at' && owner.name === 'property') {
      descriptors.get(owner.prelude)?.set(node.property, node.value.replace(/^(["'])(.*)\1$/, '$2'))
    }
  }
  const keys = Object.entries(INSTANCE_KEYS) as [InstanceKey, string][]
  const declared = keys.flatMap(([key, syntax]) => {
    const found = descriptors.get(key)
    if (!found) return [`${key}: missing`]
    return [
      ...(found.get('syntax') === syntax ? [] : [`${key}: syntax ${found.get('syntax') ?? 'missing'}`]),
      ...(found.get('inherits') === 'false' ? [] : [`${key}: inherits ${found.get('inherits') ?? 'missing'}`]),
    ]
  })
  const extra = [...descriptors.keys()].filter((name) => !INSTANCE_NAMES.has(name)).map((name) => `${name}: not in INSTANCE_KEYS`)
  return [...declared, ...extra]
}

export function subtreeAxisProblems(src: string, axes: Readonly<Record<string, readonly string[]>>): string[] {
  const selectors = ENGINES.flatMap((engine) => ruleSelectors(parseFile(resolve(src, 'engines', `${engine}.css`))))
  const subtree = (axis: string, value: string): boolean =>
    selectors.some((selector) => compounds(selector).some((compound) => attribute(axis, value).test(compound) && !ROOT.test(compound)))
  return Object.entries(axes).flatMap(([axis, values]) =>
    values.filter((value) => !subtree(axis, value)).map((value) => `${axis}=${value}: no engine rule outside :root`),
  )
}
