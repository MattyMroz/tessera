import { INPUT_CONFIG, navigates, trackInputModality } from './input-modality'

const AXES = {
  mode: ['light', 'dark', 'system'],
  accent: [
    'contrast', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan',
    'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'zinc',
  ],
  neutral: ['k1', 'k2', 'k3', 'k4'],
  corners: ['none', 'sm', 'md', 'lg', 'full'],
  curve: ['round', 'squircle'],
  density: ['compact', 'snug', 'default', 'relaxed', 'spacious'],
  size: ['xs', 'sm', 'md', 'lg', 'xl'],
  motion: ['on', 'off'],
  neon: ['off', 'mini', 'full'],
  material: ['solid', 'translucent'],
  platform: ['desktop', 'web'],
  typeset: ['inter'],
} as const

export type Axis = keyof typeof AXES

const SUBTREE_AXES = ['size', 'density', 'corners', 'curve', 'motion'] as const satisfies readonly Axis[]
export type Choices = { -readonly [A in Axis]: (typeof AXES)[A][number] }
export type Theme = Partial<Choices>
export type ThemeRoot = Pick<Element, 'getAttribute' | 'setAttribute' | 'removeAttribute'> & { readonly style: Pick<CSSStyleDeclaration, 'colorScheme'> }
export type StorageScope = { readonly localStorage: Pick<Storage, 'getItem' | 'setItem'> }

const DEFAULT_CHOICES: Choices = {
  mode: 'system',
  accent: 'contrast',
  neutral: 'k2',
  corners: 'full',
  curve: 'squircle',
  density: 'compact',
  size: 'lg',
  motion: 'on',
  neon: 'off',
  material: 'solid',
  platform: 'desktop',
  typeset: 'inter',
}

export const THEME_CONFIG = {
  axes: AXES,
  subtreeAxes: SUBTREE_AXES,
  defaults: DEFAULT_CHOICES,
  storageKey: 'ts-appearance',
  storageVersion: 1,
  changeEvent: 'ts-theme-change',
  holdAttribute: 'data-motion-hold',
  darkQuery: '(prefers-color-scheme: dark)',
} as const

type ThemeConfig = typeof THEME_CONFIG

export function resolveChoices(theme: Theme, saved: Theme, config: ThemeConfig = THEME_CONFIG): Choices {
  return { ...config.defaults, ...theme, ...saved }
}

export function readSaved(scope: StorageScope, config: ThemeConfig = THEME_CONFIG): Theme | undefined {
  let raw: string | null
  try {
    raw = scope.localStorage.getItem(config.storageKey)
  } catch {
    return undefined
  }
  let record: unknown
  try {
    record = JSON.parse(raw ?? 'null')
  } catch {
    return {}
  }
  if (typeof record !== 'object' || record === null || !('version' in record) || !('choices' in record)) return {}
  const choices = record.choices
  if (record.version !== config.storageVersion || typeof choices !== 'object' || choices === null) return {}
  const valid: Record<string, string> = {}
  for (const [axis, values] of Object.entries(config.axes)) {
    const value: unknown = Object.hasOwn(choices, axis) ? Reflect.get(choices, axis) : undefined
    if (typeof value === 'string' && values.some((option) => option === value)) valid[axis] = value
  }
  return valid as Theme
}

export function writeSaved(scope: StorageScope, saved: Theme): void {
  try {
    scope.localStorage.setItem(THEME_CONFIG.storageKey, JSON.stringify({ version: THEME_CONFIG.storageVersion, choices: saved }))
  } catch {
    return
  }
}

export function applyChoices(root: ThemeRoot, choices: Choices, prefersDark: boolean, config: ThemeConfig = THEME_CONFIG): void {
  const mode = choices.mode === 'system' ? (prefersDark ? 'dark' : 'light') : choices.mode
  const generation = String(Number(root.getAttribute(config.holdAttribute)) + 1)
  root.setAttribute(config.holdAttribute, generation)
  for (const [axis, value] of Object.entries(choices)) root.setAttribute(`data-${axis}`, axis === 'mode' ? mode : value)
  root.style.colorScheme = mode
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => {
      if (root.getAttribute(config.holdAttribute) === generation) root.removeAttribute(config.holdAttribute)
    }),
  )
  window.dispatchEvent(new Event(config.changeEvent))
}

function bootTheme(
  theme: Theme,
  config: ThemeConfig,
  input: typeof INPUT_CONFIG,
  read: typeof readSaved,
  resolve: typeof resolveChoices,
  apply: typeof applyChoices,
  track: typeof trackInputModality,
  isNavigation: typeof navigates,
): void {
  const media = window.matchMedia(config.darkQuery)
  const current = (): Choices => resolve(theme, read(window, config) ?? {}, config)
  apply(document.documentElement, current(), media.matches, config)
  media.addEventListener('change', () => {
    const choices = current()
    if (choices.mode === 'system') apply(document.documentElement, choices, media.matches, config)
  })
  track(document, input, isNavigation)
}

export function themeScript(theme: Theme): string {
  const data = JSON.stringify([theme, THEME_CONFIG, INPUT_CONFIG]).slice(1, -1).replaceAll('<', '\\u003c')
  const helpers = [readSaved, resolveChoices, applyChoices, trackInputModality, navigates].map(String).join(',')
  return `(${String(bootTheme)})(${data},${helpers});`
}
