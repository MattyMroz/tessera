import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { expect, it } from 'vitest'
import { colorRoles, renderColorCss } from '../../scripts/colors'
import { ACCENTS, DEFAULT_NEUTRAL, MODES, NEUTRALS } from '../../scripts/palette'
import { THEME_CONFIG, type Choices } from '../../src/lib/theme'
import { APPEARANCE_PROPS } from '../../src/lib/unstyled'
import { componentSourceProblems, hostContextProblems } from './component-source'
import { containerWidthProblems, ENGINES, instanceRegistryProblems, subtreeAxisProblems, toneProblems } from './css-layers'

const packageRoot = resolve(import.meta.dirname, '../..')
const src = resolve(packageRoot, 'src')
const repo = resolve(packageRoot, '../..')
const MEASURING_FILES = [
  'lib/bar-overflow.ts',
  'lib/indicator.ts',
  'lib/motion.ts',
  'lib/popup-flight.ts',
  'lib/press.ts',
  'lib/select-align.ts',
  'lib/submenu-pointer.ts',
  'lib/title-when-cut.ts',
  'lib/tooltip.ts',
]
const SINGLE_CHOICE = 'lib/single-choice.ts'
const DOM_MEASUREMENT =
  /\b(?:getBoundingClientRect|offset(?:Left|Top|Width|Height)|ResizeObserver|getComputedStyle|scroll(?:Width|Height|Top|Left)|client(?:Width|Height))\b/

function shippedSources(directory: string): string[] {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
    .map((entry) => relative(directory, resolve(entry.parentPath, entry.name)).replaceAll('\\', '/'))
}

it('keeps src/engines equal to one flat file per engine of the engine graph', () => {
  expect(readdirSync(resolve(src, 'engines')).sort()).toEqual(ENGINES.map((engine) => `${engine}.css`).sort())
})

it('measures the DOM only in the named behaviour files', () => {
  const sources = shippedSources(src)
  expect(sources).toContain(SINGLE_CHOICE)
  const measuring = sources.filter((file) => DOM_MEASUREMENT.test(readFileSync(resolve(src, file), 'utf8')))
  expect(measuring.filter((file) => !MEASURING_FILES.includes(file))).toEqual([])
})

it.each([
  'target.getBoundingClientRect()',
  'target.offsetLeft',
  'target.offsetTop',
  'target.offsetWidth',
  'target.offsetHeight',
  'new ResizeObserver(update)',
  'getComputedStyle(document.documentElement)',
  'label.scrollWidth > label.clientWidth',
  'list.scrollHeight',
  'list.clientHeight',
  'viewport.scrollTop',
  'viewport.scrollLeft',
])('recognises %s as DOM measurement', (code) => {
  expect(DOM_MEASUREMENT.test(code)).toBe(true)
})

const colorCss = readFileSync(resolve(src, 'engines/color.css'), 'utf8')
const COLOR_OUTPUT = /(--ts-color-[a-z-]+):\s*([^;]+);/g
const COLOR_VARIABLE = /var\((--ts-color-[a-z-]+)\)/g
const ATTRIBUTE = /\[data-([a-z]+)="([^"]+)"\]/g

function cascadeColor(attributes: Record<string, string>): Record<string, string> {
  const rules = [...colorCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector = '', body = '']) => {
    const parts = [...selector.matchAll(ATTRIBUTE)]
    const root = selector.trim() === ':root'
    const matches = root || (parts.length > 0 && parts.every(([, name = '', value]) => attributes[name] === value))
    return { matches, specificity: root ? 1 : parts.length, body }
  })
  const declared = new Map<string, string>()
  for (const { body } of rules.filter((rule) => rule.matches).sort((a, b) => a.specificity - b.specificity)) {
    for (const [, name = '', value = ''] of body.matchAll(COLOR_OUTPUT)) declared.set(name, value.trim())
  }
  const computed = (name: string): string =>
    (declared.get(name) ?? `unset ${name}`).replace(COLOR_VARIABLE, (_, reference: string) => computed(reference))
  return Object.fromEntries([...declared.keys()].map((name) => [name.replace('--ts-color-', ''), computed(name)]))
}

it('keeps color.css equal to the output of the color generator', () => {
  expect(colorCss).toBe(renderColorCss())
})

it.each(MODES.flatMap((mode) => ACCENTS.flatMap((accent) => NEUTRALS.map((neutral) => [mode, accent, neutral] as const))))(
  'gives every color role its palette value in %s mode with the %s accent and %s black',
  (mode, accent, neutral) => {
    expect(cascadeColor({ mode, accent, neutral })).toEqual(Object.fromEntries(colorRoles(mode, accent, neutral)))
  },
)

it.each([
  [{}, 'light', 'contrast'],
  [{ mode: 'dark' }, 'dark', 'contrast'],
  [{ accent: 'violet' }, 'light', 'violet'],
  [{ mode: 'dark', accent: 'violet' }, 'dark', 'violet'],
] as const)('falls back to the default inputs for %o', (attributes, mode, accent) => {
  expect(cascadeColor(attributes)).toEqual(Object.fromEntries(colorRoles(mode, accent, DEFAULT_NEUTRAL)))
})

const engineCss = ENGINES.map((engine) => readFileSync(resolve(src, `engines/${engine}.css`), 'utf8')).join('\n')
const ROOT_CHOICES: Readonly<Record<string, string>> = { ...THEME_CONFIG.defaults, mode: 'light' } satisfies Choices
const SCRIPT_RESOLVED_CHOICES: Readonly<Record<string, string>> = { mode: 'system' } satisfies Partial<Choices>
const RULED_CHOICES = Object.entries(THEME_CONFIG.axes).flatMap(([axis, values]) =>
  values
    .filter((value) => value !== ROOT_CHOICES[axis] && value !== SCRIPT_RESOLVED_CHOICES[axis])
    .map((value) => [axis, value] as const),
)

it.each(RULED_CHOICES)('gives the theme choice %s=%s a rule in the engine CSS', (axis, value) => {
  expect(engineCss).toMatch(new RegExp(`\\[data-${axis}=(["'])${value}\\1\\]`))
})

const AXES: Readonly<Record<string, readonly string[]>> = THEME_CONFIG.axes
const ENGINE_ATTRIBUTE = /\[data-([a-z]+)=(["'])([^"']+)\2\]/g
const AXIS_RULES = [...engineCss.matchAll(ENGINE_ATTRIBUTE)]
  .map(([, axis = '', , value = '']) => [axis, value] as const)
  .filter(([axis]) => Object.hasOwn(AXES, axis))

it('rules the engine CSS only for values of the theme axes', () => {
  expect(AXIS_RULES.length).toBeGreaterThan(0)
  expect(AXIS_RULES.filter(([axis, value]) => !AXES[axis]?.includes(value))).toEqual([])
})

const LAB_APP = resolve(repo, 'apps/docs/app')
const COMPONENT_IMPORT = /from '@mattymroz\/tessera\/components\/[a-z-]+\/([a-z-]+)'/g
const LOCAL_IMPORT = /from '(\.{1,2}\/[^']+)'/g
const MIN_LAB_PAGES = 2
const UNCOUNTED_PAGES: readonly string[] = ['stress', 'proposals']
const COMPONENTS = shippedSources(resolve(src, 'components')).map((file) => basename(file, '.tsx'))
const ALL_LAB_PAGES = readdirSync(LAB_APP, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name === 'page.tsx')
  .map((entry) => resolve(entry.parentPath, entry.name))

function countedPages(pages: readonly string[]): string[] {
  return pages.filter((page) => !UNCOUNTED_PAGES.includes(relative(LAB_APP, dirname(page)).replaceAll('\\', '/')))
}

const LAB_PAGES = countedPages(ALL_LAB_PAGES)

function localModule(from: string, specifier: string): string | undefined {
  return ['.tsx', '.ts'].map((extension) => resolve(dirname(from), `${specifier}${extension}`)).find((file) => existsSync(file))
}

function modulesReachedFrom(file: string, seen: Set<string> = new Set()): Set<string> {
  seen.add(file)
  for (const [, specifier = ''] of readFileSync(file, 'utf8').matchAll(LOCAL_IMPORT)) {
    const next = localModule(file, specifier)
    if (next && !seen.has(next)) modulesReachedFrom(next, seen)
  }
  return seen
}

function componentsReachedFrom(file: string): Set<string> {
  return new Set([...modulesReachedFrom(file)].flatMap((module) => [...readFileSync(module, 'utf8').matchAll(COMPONENT_IMPORT)].map(([, name = '']) => name)))
}

it('finds the components and the lab pages it checks for coverage', () => {
  expect(COMPONENTS.length).toBeGreaterThan(0)
  expect(LAB_PAGES.length).toBeGreaterThanOrEqual(MIN_LAB_PAGES)
})

it('leaves the stress scene and the proposals page out of the lab pages that count', () => {
  const pages = ['stress', 'proposals', 'screens/edges', 'components'].map((path) => resolve(LAB_APP, path, 'page.tsx'))
  expect(countedPages(pages)).toEqual(pages.slice(2))
})

it.each(COMPONENTS)('documents %s in docs/ and shows it on at least two lab pages', (name) => {
  expect(existsSync(resolve(packageRoot, 'docs', `${name}.md`))).toBe(true)
  expect(LAB_PAGES.filter((page) => componentsReachedFrom(page).has(name)).length).toBeGreaterThanOrEqual(MIN_LAB_PAGES)
})

const ELEMENT_PROPS = /(Unstyled<)?(?:Base\w+\.([\w.]+)\.Props\b|ComponentProps<'[a-z\d]+'>|HTMLAttributes<\w+>)/g
const ELEMENTLESS_PARTS = new Set(['Root', 'SubmenuRoot'])

function openElementProps(files: Readonly<Record<string, string>>): string[] {
  return Object.entries(files).flatMap(([file, code]) =>
    [...code.matchAll(ELEMENT_PROPS)].filter(([, closed, part]) => !closed && !(part && ELEMENTLESS_PARTS.has(part))).map(([text]) => `${file}: ${text}`),
  )
}

it('finds the element props that skip Unstyled and accepts the element-less Base UI roots', () => {
  expect(openElementProps({
    'components/a.tsx': 'type A = Unstyled<BaseMenu.Popup.Props>; type B = Unstyled<ComponentProps<\'div\'>, \'children\'>; type C = BaseMenu.Root.Props',
    'components/b.tsx': "type D = Omit<BaseMenu.Item.Props, 'className' | 'style' | 'render'>; type E = Omit<ComponentProps<'span'>, 'style'>; type F = HTMLAttributes<HTMLElement>",
  })).toEqual([
    'components/b.tsx: BaseMenu.Item.Props',
    "components/b.tsx: ComponentProps<'span'>",
    'components/b.tsx: HTMLAttributes<HTMLElement>',
  ])
})

it('closes className, style and render through the one Unstyled type on every element and Base UI part a component takes', () => {
  expect(APPEARANCE_PROPS).toEqual(['className', 'style', 'render'])
  const files = Object.fromEntries(
    shippedSources(src)
      .filter((file) => file.startsWith('components/') || file.startsWith('lib/'))
      .map((file) => [file, readFileSync(resolve(src, file), 'utf8')]),
  )
  expect(Object.values(files).some((code) => [...code.matchAll(ELEMENT_PROPS)].length > 0)).toBe(true)
  expect(openElementProps(files)).toEqual([])
})

const eslintConfig = readFileSync(resolve(repo, 'eslint.config.js'), 'utf8')
const CONFIG_BLOCK = /\n {2}\{\n([\s\S]*?)\n {2}\}/g
const BLOCK_NAME = /name: '([^']+)',/
const RULE_DISABLED = /:\s*(?:'off'|"off"|0(?![\d.]))/
const LAB_BLOCKS: Readonly<Record<string, string>> = {
  'lab/tessera-consumer': "files: ['apps/docs/**/*.{js,mjs,ts,tsx}'], extends: [tessera.configs.recommended],",
  'lab/foundation-draws-engine-outputs-inline':
    "files: ['apps/docs/app/foundation/page.tsx'], rules: { 'tessera/no-local-appearance': 'off' },",
  'lab/first-frame-probe':
    "files: ['apps/docs/tests/lab.spec.ts'], rules: { 'tessera/compositor-motion': [ 'error', { animationFrameReason: 'the anti-FOUC test reads the theme attributes in the first rendering frame' }, ], },",
  'lab/tooltip-frame-probe':
    "files: ['apps/docs/tests/tooltip.spec.ts'], rules: { 'tessera/compositor-motion': [ 'error', { animationFrameReason: 'the tooltip guards read the shown tooltip in every rendering frame' }, ], },",
  'lab/sliding-frame-probe':
    "files: ['apps/docs/tests/sliding.spec.ts'], rules: { 'tessera/compositor-motion': [ 'error', { animationFrameReason: 'the sliding guards read the pill and the menus in every rendering frame' }, ], },",
}

it('configures the lab with the consumer plugin, one rule turned off for the foundation page and one rule configured for each frame probe', () => {
  const blocks = [...eslintConfig.matchAll(CONFIG_BLOCK)].map(([, body = '']) => body.replace(/\s+/g, ' ').trim())
  const lab = blocks.filter((body) => body.includes('apps/docs'))
  expect(Object.fromEntries(lab.map((body) => [BLOCK_NAME.exec(body)?.[1], body.replace(BLOCK_NAME, '').trim()]))).toEqual(LAB_BLOCKS)
  expect(blocks.filter((body) => RULE_DISABLED.test(body))).toEqual([
    `name: 'lab/foundation-draws-engine-outputs-inline', ${LAB_BLOCKS['lab/foundation-draws-engine-outputs-inline']}`,
  ])
})

const TIME_LITERAL =
  /\b(?:animate|setTimeout)\([^\n]*,\s*-?\d*\.?\d+\s*\)(?!['"`])|\b(?:duration|delay|endDelay)\s*:\s*-?\.?\d|(['"`])-?\d*\.?\d+m?s\1/
const SAMPLE_STEP_CONSTANT = /^export const SAMPLE_STEP = 1 \/ 60$/m

it('takes every motion time in lib from the motion engine', () => {
  const lib = shippedSources(src).filter((file) => file.startsWith('lib/'))
  expect(lib).toContain(SINGLE_CHOICE)
  expect(lib.filter((file) => TIME_LITERAL.test(readFileSync(resolve(src, file), 'utf8')))).toEqual([])
})

const MOTION_TIME_OUTPUT = /^--ts-motion-(?:duration-|ease-|choice-|press-hold)/
const MOTION_DECLARATION = /(--ts-motion-[a-z-]+):\s*([^;]+);/g
const CSS_TIME_LITERAL = /(?:transition|animation)[a-z-]*:[^;]*(?<![\w.-])\d*\.?\d+m?s\b/

function stylesheets(directory: string): string[] {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => relative(directory, resolve(entry.parentPath, entry.name)).replaceAll('\\', '/'))
}

it('gives every time output of the motion engine a consumer and keeps every time of CSS in the engine', () => {
  const engine = readFileSync(resolve(src, 'engines/motion.css'), 'utf8')
  const declared = [...engine.matchAll(MOTION_DECLARATION)].map(([, name = '', value = '']) => ({ name, value }))
  const outputs = [...new Set(declared.map(({ name }) => name))].filter((name) => MOTION_TIME_OUTPUT.test(name))
  const outside = [...stylesheets(src).filter((file) => file !== 'engines/motion.css'), ...shippedSources(src)]
    .map((file) => readFileSync(resolve(src, file), 'utf8'))
    .join('\n')
  const read = (name: string, text: string): boolean => new RegExp(`${name}(?![a-z-])`).test(text)
  const used = (name: string, seen: ReadonlySet<string> = new Set()): boolean =>
    read(name, outside) ||
    declared.some((other) => !seen.has(other.name) && other.name !== name && read(name, other.value) && used(other.name, new Set([...seen, name])))
  expect(outputs.filter((name) => !used(name))).toEqual([])
  expect(outputs.length).toBeGreaterThan(0)
  expect(stylesheets(src).filter((file) => file !== 'engines/motion.css' && CSS_TIME_LITERAL.test(readFileSync(resolve(src, file), 'utf8')))).toEqual([])
})

it('names the sampling step of the choice flight as the one time constant in lib', () => {
  expect(readFileSync(resolve(src, 'lib/flight.ts'), 'utf8')).toMatch(SAMPLE_STEP_CONSTANT)
})

it.each([
  'popup.animate(frames, 150)',
  "popup.animate([{ transform: 'none' }], 0.15)",
  'setTimeout(lift, 100)',
  '{ duration: 150, easing }',
  '{ easing, delay: 50 }',
  "const hold = '100ms'",
  'const slide = ".15s"',
])('recognises %s as a time literal', (code) => {
  expect(TIME_LITERAL.test(code)).toBe(true)
})

it.each([
  "popup.animate([{ transform: 'translate(0, 0)' }], { duration: follow, easing: ease })",
  'setTimeout(lift, delay)',
  '{ duration: flight.duration, easing: flight.easing }',
  'const SAMPLE_STEP = 1 / 60',
])('accepts %s', (code) => {
  expect(TIME_LITERAL.test(code)).toBe(false)
})

const fixtures = resolve(import.meta.dirname, 'fixtures')
const goodFixture = resolve(fixtures, 'good')
const badFixture = resolve(fixtures, 'bad')

it('finds a rule for every tone in control, row and surface, a raised rule with a tone in control and a border, a local border, an outline or an inset shadow in a tone rule of surface', () => {
  expect(toneProblems(goodFixture)).toEqual([])
  expect(toneProblems(badFixture)).toEqual([
    "control: no rule for data-tone='neutral'",
    "control: no rule for data-tone='accent'",
    "control: no rule for data-tone='danger'",
    "control: no rule for data-tone='success'",
    "control: no rule for data-tone='warning'",
    "control: no rule for data-tone='info'",
    'control: no rule for raised with a tone',
    "row: no rule for data-tone='accent'",
    "row: no rule for data-tone='danger'",
    "row: no rule for data-tone='success'",
    "row: no rule for data-tone='warning'",
    "row: no rule for data-tone='info'",
    "surface: no rule for data-tone='neutral'",
    "surface: no rule for data-tone='accent'",
    "surface: no rule for data-tone='success'",
    "surface: no rule for data-tone='warning'",
    "surface: no rule for data-tone='info'",
    'surface: border-color in a tone rule',
    'surface: --_border in a tone rule',
    'surface: outline in a tone rule',
    'surface: box-shadow in a tone rule',
  ])
})

it('gives every tone a rule in control, row and surface, a raised rule with a tone in control and no border in a tone rule of surface', () => {
  expect(toneProblems(src)).toEqual([])
})

it('finds every container width that no recipe or component queries', () => {
  expect(containerWidthProblems(goodFixture)).toEqual([])
  expect(containerWidthProblems(badFixture)).toEqual(['unused container width: narrow'])
})

it('queries every container width in a recipe or a component', () => {
  expect(containerWidthProblems(src)).toEqual([])
})

it('finds every instance key missing from the size engine registry, registered with another syntax or inherited', () => {
  expect(instanceRegistryProblems(goodFixture)).toEqual([])
  expect(instanceRegistryProblems(badFixture)).toEqual([
    '--ts-i-value: syntax <length>',
    '--ts-i-value: inherits true',
    '--ts-i-inline-size: inherits missing',
    '--ts-i-block-size: missing',
    '--ts-i-tip-x: missing',
    '--ts-i-tip-y: missing',
    '--ts-i-tip-width: missing',
    '--ts-i-tip-arrow: missing',
    '--ts-i-tip-room: missing',
    '--ts-i-tip-squish: missing',
    '--ts-i-extra: not in INSTANCE_KEYS',
  ])
})

it('registers exactly the instance keys in the size engine', () => {
  expect(instanceRegistryProblems(src)).toEqual([])
})

it('finds every value of a subtree axis that the engines rule only on :root', () => {
  expect(subtreeAxisProblems(goodFixture, { size: ['xs'], motion: ['on'] })).toEqual([])
  expect(subtreeAxisProblems(badFixture, { size: ['xs'], corners: ['square'] })).toEqual([
    'size=xs: no engine rule outside :root',
    'corners=square: no engine rule outside :root',
  ])
})

it('gives every value of every subtree axis an engine rule outside :root', () => {
  const subtree = Object.fromEntries(THEME_CONFIG.subtreeAxes.map((axis) => [axis, THEME_CONFIG.axes[axis]]))
  expect(Object.keys(subtree).length).toBeGreaterThan(0)
  expect(subtreeAxisProblems(src, subtree)).toEqual([])
})

function missingEdgeSections(components: readonly string[], page: string): string[] {
  return components.filter((name) => !new RegExp(`data-edge-component=(["'])${name}\\1`).test(page))
}

it('finds every component without a section on the edges screen', () => {
  expect(missingEdgeSections(['button', 'text'], `<section data-edge-component='button' /><section data-edge-component="text" />`)).toEqual([])
  expect(missingEdgeSections(['button', 'heading'], '<section data-edge-component="button" /><section data-edge-component="heading-large" />')).toEqual([
    'heading',
  ])
})

it('gives every component a section on the edges screen', () => {
  const screen = [...modulesReachedFrom(resolve(LAB_APP, 'screens/edges/page.tsx'))].map((file) => readFileSync(file, 'utf8')).join('\n')
  expect(missingEdgeSections(COMPONENTS, screen)).toEqual([])
})

const TIME_CONSTANTS = [
  'SAMPLE_STEP',
  'SUBMENU_REST',
  'TOOLTIP_OPEN_DELAY',
  'TOOLTIP_GROUP_GRACE',
  'TOOLTIP_CLOSE_DELAY',
  'TYPEAHEAD_RESET',
]
const NUMERIC_CONSTANT = /^\s*(?:export )?const ([A-Za-z_$][\w$]*)(?::\s*number)? = [\d\s.+*/()e-]+$/gm
const TIME_USE =
  /\b(?:setTimeout|setInterval)\([^\n]*?,\s*([A-Za-z_$][\w$]*)\s*\)|\b(?:duration|delay|closeDelay|endDelay|grace|timeout)\s*(?::|=\{)\s*([A-Za-z_$][\w$]*)\b/g
const CONSTANT_NAME = /^[A-Z][A-Z\d_]*$/

function numericConstants(entries: readonly (readonly [string, string])[]): Set<string> {
  return new Set(entries.flatMap(([, code]) => [...code.matchAll(NUMERIC_CONSTANT)].map(([, name = '']) => name)))
}

function timeConstantProblems(files: Readonly<Record<string, string>>): string[] {
  const entries = Object.entries(files)
  const defined = numericConstants(entries.filter(([file]) => file.startsWith('lib/')))
  const numeric = numericConstants(entries)
  const timed = new Set(entries.flatMap(([, code]) => [...code.matchAll(TIME_USE)].map(([, call, option]) => call ?? option ?? '')))
  const constant = (name: string): boolean => CONSTANT_NAME.test(name) || numeric.has(name)
  return [
    ...TIME_CONSTANTS.filter((name) => !defined.has(name)).map((name) => `${name}: no numeric constant in lib`),
    ...[...timed].filter((name) => constant(name) && !TIME_CONSTANTS.includes(name)).map((name) => `${name}: time constant outside the list`),
  ]
}

it('accepts the listed time constants defined in lib and used by lib and components', () => {
  expect(timeConstantProblems({
    'lib/flight.ts': 'export const SAMPLE_STEP = 1 / 60\nconst MAX_SAMPLES = 600',
    'lib/motion.ts': 'export const MILLISECONDS_PER_SECOND = 1000',
    'lib/popup-flight.ts': 'export function menuGrace(motion: Motion): number {\n  return motion.hoverOut\n}',
    'lib/submenu-pointer.ts': 'export const SUBMENU_REST = 100\nrest = window.setTimeout(choose, SUBMENU_REST)',
    'lib/tooltip.ts':
      'export const TOOLTIP_OPEN_DELAY = 400\nexport const TOOLTIP_GROUP_GRACE: number = 400\nexport const TOOLTIP_CLOSE_DELAY = 100\nopening = window.setTimeout(open, TOOLTIP_OPEN_DELAY)\nclosing = window.setTimeout(hide, TOOLTIP_CLOSE_DELAY)',
    'lib/collection.ts': "export const TYPEAHEAD_RESET = 500\nif (now - last > TYPEAHEAD_RESET) buffer = ''",
    'lib/press.ts': 'timer = setTimeout(lift, delay)',
    'components/menu/menu.tsx': 'createPopupFlight({ grace: menuGrace })',
  })).toEqual([])
})

it('finds a listed time constant missing from lib and a time constant outside the list', () => {
  expect(timeConstantProblems({
    'lib/flight.ts': 'export const SAMPLE_STEP = 1 / 60',
    'lib/popup-flight.ts': 'const HOLD = 300\nsetTimeout(release, HOLD)',
    'components/menu/menu.tsx': 'const SWITCH_DELAY = 150\ncreatePopupFlight({ grace: SWITCH_DELAY })',
    'components/tooltip/tooltip.tsx':
      '<BaseTooltip.Provider timeout={OPEN_WINDOW}>{children}</BaseTooltip.Provider>\n<BaseTooltip.Trigger closeDelay={LEAVE_WINDOW} />',
    'components/text/text.tsx': 'const TOOLTIP_GROUP_GRACE = 400',
    'lib/press.ts': 'function hold() {\n  const wait = 300\n  setTimeout(lift, wait)\n}',
    'lib/scope.ts': 'const holdTime: number = 0.3e3\nanimate(frames, { duration: holdTime })',
  })).toEqual([
    'SUBMENU_REST: no numeric constant in lib',
    'TOOLTIP_OPEN_DELAY: no numeric constant in lib',
    'TOOLTIP_GROUP_GRACE: no numeric constant in lib',
    'TOOLTIP_CLOSE_DELAY: no numeric constant in lib',
    'TYPEAHEAD_RESET: no numeric constant in lib',
    'HOLD: time constant outside the list',
    'SWITCH_DELAY: time constant outside the list',
    'OPEN_WINDOW: time constant outside the list',
    'LEAVE_WINDOW: time constant outside the list',
    'wait: time constant outside the list',
    'holdTime: time constant outside the list',
  ])
})

const SHIPPED_CODE: Readonly<Record<string, string>> = Object.fromEntries(
  shippedSources(src).map((file) => [file, readFileSync(resolve(src, file), 'utf8')]),
)

it('defines the listed time constants in lib and times nothing in lib or components with another constant', () => {
  expect(Object.keys(SHIPPED_CODE)).toContain(SINGLE_CHOICE)
  expect(timeConstantProblems(SHIPPED_CODE)).toEqual([])
})

const INSTANCE_WRITE = /(?<!function\s+)\bwriteInstance\(/

function instanceWriterProblems(files: Readonly<Record<string, string>>): string[] {
  return Object.entries(files)
    .filter(([file, code]) => file.startsWith('lib/') && !MEASURING_FILES.includes(file) && INSTANCE_WRITE.test(code))
    .map(([file]) => `${file}: writeInstance outside the measuring files`)
}

it('accepts writeInstance in the measuring files and in components', () => {
  expect(instanceWriterProblems({
    'lib/instance.ts': 'export function writeInstance(element: HTMLElement, values: InstanceValues): void {}',
    'lib/indicator.ts': "writeInstance(pill, { '--ts-i-inline-size': `${box.width}px` })",
    'components/progress/progress.tsx': "writeInstance(fill, { '--ts-i-value': value })",
  })).toEqual([])
})

it('finds writeInstance in a lib file outside the measuring files', () => {
  expect(instanceWriterProblems({
    'lib/scope.ts': "writeInstance(popup, { '--ts-i-inline-size': `${rect.width}px` })",
    'lib/collection.ts': "import { writeInstance } from './instance'\nwriteInstance(button, values)",
  })).toEqual(['lib/scope.ts: writeInstance outside the measuring files', 'lib/collection.ts: writeInstance outside the measuring files'])
})

it('writes instance values from lib only in the measuring files', () => {
  expect(Object.values(SHIPPED_CODE).some((code) => INSTANCE_WRITE.test(code))).toBe(true)
  expect(instanceWriterProblems(SHIPPED_CODE)).toEqual([])
})

it.each([
  ['a text child', 'export const A = () => <button>Cancel</button>', 'UI text in JSX'],
  ['a string child', "export const A = () => <span>{'Close'}</span>", 'UI text in JSX'],
  ['a text attribute', 'export const A = () => <button aria-label="Close" />', 'UI text in a text attribute'],
  ['a text attribute in braces', "export const A = () => <input placeholder={'Search'} />", 'UI text in a text attribute'],
  ['a fallback', "export const A = ({ label }) => <b>{label ?? 'Cancel'}</b>", 'UI text as a fallback'],
  ['a default value', "export function A({ cancelLabel = 'Cancel' }) { return <b>{cancelLabel}</b> }", 'UI text as a default value'],
  ['a click on a div', 'export const A = () => <div onClick={go} />', 'onClick on a non-interactive element'],
  ['a click on a span with a static role', 'export const A = () => <span role="group" onClick={go} />', 'onClick on a non-interactive element'],
])('finds %s in a component source', (_, source, rule) => {
  expect(componentSourceProblems(source).map((problem) => problem.rule)).toEqual([rule])
})

it('accepts data attributes, labels from props, clicks on interactive elements and on a composite widget', () => {
  const source = [
    'export const A = ({ label, go }) => (',
    '  <div data-recipe="control" data-variant="ghost" role="radiogroup" onClick={go}>',
    '    <button aria-label={label} onClick={go}>{label}</button>',
    '    <Base.Item onClick={go} />',
    '  </div>',
    ')',
  ].join('\n')
  expect(componentSourceProblems(source)).toEqual([])
})

const OPTIONAL_CONTEXT_REASONS: Readonly<Record<string, string>> = {
  BarContext: 'a Tooltip outside a TooltipBar owns its popup, so no bar is a state, not a misplaced part',
  FillContext: 'a menu outside an accent menubar fills its hover pill with the neutral hover step, so no fill is a state, not a misplaced part',
}
const OPTIONAL_CONTEXTS: ReadonlySet<string> = new Set(Object.keys(OPTIONAL_CONTEXT_REASONS))

it.each([
  ['a context with a stand-in default', 'const Group = createContext<Group>({ choose: () => undefined })', 'context with a default value'],
  ['a context made with a real default', 'const Group = createContext(createSingleChoice(null))', 'context with a default value'],
  ['a host context read without useHost', 'function Item() { const group = use(GroupContext) }', 'context read outside useHost'],
])('finds %s', (_, source, rule) => {
  expect(hostContextProblems(source, OPTIONAL_CONTEXTS).map((problem) => problem.rule)).toEqual([rule])
})

it('accepts a null host context read by useHost, the readers in lib/slot.ts and a named optional context', () => {
  const source = [
    'const GroupContext = createContext<Group | null>(null)',
    'function Item() { const group = useHost(GroupContext, "Group", "Item") }',
    'function useHost(context) { return use(context) }',
    'function usePart(host) { return use(SlotHost) === host }',
    'function Tooltip() { const bar = use(BarContext) }',
  ].join('\n')
  expect(hostContextProblems(source, OPTIONAL_CONTEXTS)).toEqual([])
})

it('gives every context of lib and components a null default and reads every host context through useHost', () => {
  const files = shippedSources(src).filter((file) => file.startsWith('components/') || file.startsWith('lib/'))
  const problems = files.flatMap((file) =>
    hostContextProblems(readFileSync(resolve(src, file), 'utf8'), OPTIONAL_CONTEXTS, file).map((problem) => `${file}:${problem.line} ${problem.rule}: ${problem.text}`),
  )
  expect(files.some((file) => readFileSync(resolve(src, file), 'utf8').includes('useHost('))).toBe(true)
  expect(problems).toEqual([])
})

it('keeps every component free of UI text and of clicks on non-interactive elements', () => {
  const files = shippedSources(resolve(src, 'components')).filter((file) => file.endsWith('.tsx'))
  expect(files.length).toBeGreaterThan(0)
  const problems = files.flatMap((file) =>
    componentSourceProblems(readFileSync(resolve(src, 'components', file), 'utf8'), file).map((problem) => `${file}:${problem.line} ${problem.rule}: ${problem.text}`),
  )
  expect(problems).toEqual([])
})
