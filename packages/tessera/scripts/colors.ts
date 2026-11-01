import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  ACCENT_FAMILIES,
  ACCENT_NAMES,
  ALPHA,
  BLACKS,
  DARK_FOREGROUND,
  DARK_LADDER,
  DEFAULT_NEUTRAL,
  LIGHT_NEUTRAL,
  NEUTRALS,
  SCRIM_INK,
  SHIFTED_SURFACE_CEILING,
  STATUS_FAMILIES,
  STATUSES,
  TEXT_CHROMA_SCALE,
  TEXT_TONES,
  WHITE,
  type Accent,
  type AccentFamily,
  type DarkTone,
  type Foreground,
  type Mode,
  type Neutral,
  type Oklch,
} from './palette'

export const COLOR_ROLES = [
  'background',
  'secondary-background',
  'tertiary-background',
  'raised-background',
  'inverse-background',
  'chip',
  'tooltip',
  'label',
  'secondary-label',
  'hint-label',
  'tertiary-label',
  'quaternary-label',
  'inverse-label',
  'tooltip-label',
  'inverse-hover',
  'inverse-press',
  'thumb',
  'separator',
  'opaque-separator',
  'control-border',
  'tint',
  'tint-bright',
  'tint-dim',
  'on-tint',
  'glow',
  'success',
  'warning',
  'danger',
  'info',
  'on-success',
  'on-warning',
  'on-danger',
  'on-info',
  'scrim',
] as const

export type ColorRole = (typeof COLOR_ROLES)[number]

type Roles = Partial<Record<ColorRole, string>>

type NeutralTones = Record<keyof typeof LIGHT_NEUTRAL, string>

const OUTPUT_PREFIX = '--ts-color-'
const VARIABLE = /var\(--ts-color-([a-z-]+)\)/g
const TARGET = resolve(import.meta.dirname, '../src/engines/color.css')

const parse = (hex: string): number[] => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))

const toHex = (rgb: readonly number[]): string =>
  `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`

const gamma = (v: number): number => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

function oklchToLinear(lightness: number, chroma: number, hue: number): number[] {
  const a = chroma * Math.cos((hue * Math.PI) / 180)
  const b = chroma * Math.sin((hue * Math.PI) / 180)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const inGamut = (lightness: number, chroma: number, hue: number): boolean =>
  oklchToLinear(lightness, chroma, hue).every((v) => v >= -1e-5 && v <= 1 + 1e-5)

function maxChroma(lightness: number, hue: number): number {
  let low = 0
  let high = 0.4
  for (let step = 0; step < 18; step++) {
    const middle = (low + high) / 2
    if (inGamut(lightness, middle, hue)) low = middle
    else high = middle
  }
  return low
}

const gamutHex = ([lightness, chroma, hue]: Oklch): string =>
  toHex(
    oklchToLinear(lightness, Math.min(chroma, maxChroma(lightness, hue)), hue).map(
      (v) => gamma(Math.min(1, Math.max(0, v))) * 255,
    ),
  )

const decimal = (value: number, digits: number): string => String(Number(value.toFixed(digits)))

const sourceOklch = ([lightness, chroma, hue]: Oklch, alpha?: number): string =>
  `oklch(${decimal(lightness * 100, 1)}% ${decimal(chroma, 3)} ${decimal(hue, 3)}${alpha === undefined ? '' : ` / ${alpha}`})`

const rgba = (hex: string, alpha: number): string => `rgb(${parse(hex).join(' ')} / ${alpha})`

const foregroundHex = (foreground: Foreground): string => (foreground === 'white' ? WHITE : gamutHex(DARK_FOREGROUND))

const variable = (role: ColorRole): string => `var(${OUTPUT_PREFIX}${role})`

function darkTones(neutral: Neutral): NeutralTones {
  const black = BLACKS[neutral]
  const tone = (name: DarkTone, scale: number): string => {
    const lightness = DARK_LADDER[name]
    const shifted = lightness < SHIFTED_SURFACE_CEILING ? lightness + black.shift : lightness
    return gamutHex([shifted, black.chroma * scale, black.hue])
  }
  const ladder = (name: DarkTone): string => tone(name, TEXT_TONES.includes(name) ? TEXT_CHROMA_SCALE : 1)
  return {
    background: ladder('background'),
    'secondary-background': ladder('secondary-background'),
    'tertiary-background': ladder('tertiary-background'),
    'raised-background': ladder('raised-background'),
    'inverse-background': tone('label', 1),
    chip: ladder('chip'),
    tooltip: ladder('tooltip'),
    label: ladder('label'),
    'secondary-label': ladder('secondary-label'),
    'hint-label': ladder('hint-label'),
    'tertiary-label': ladder('tertiary-label'),
    'quaternary-label': ladder('quaternary-label'),
    'inverse-label': ladder('background'),
    'tooltip-label': ladder('label'),
    'inverse-hover': ladder('inverse-hover'),
    'inverse-press': ladder('inverse-press'),
    thumb: WHITE,
    'opaque-separator': ladder('opaque-separator'),
    ink: ladder('ink'),
  }
}

function neutralRoles(mode: Mode, neutral: Neutral): Roles {
  const { ink, ...tones } = mode === 'light' ? LIGHT_NEUTRAL : darkTones(neutral)
  const alpha = ALPHA[mode]
  return {
    ...tones,
    separator: rgba(ink, alpha.separator),
    'control-border': rgba(ink, alpha['control-border']),
    scrim: rgba(SCRIM_INK, alpha.scrim),
  }
}

const CONTRAST_ROLES: Roles = {
  tint: variable('inverse-background'),
  'tint-bright': variable('inverse-background'),
  'tint-dim': variable('inverse-background'),
  'on-tint': variable('inverse-label'),
  glow: 'transparent',
}

const familyRoles = (family: AccentFamily, mode: Mode): Roles => ({
  tint: sourceOklch(family.base),
  'tint-bright': sourceOklch(family.bright),
  'tint-dim': sourceOklch(family.dim),
  'on-tint': foregroundHex(family.foreground),
  glow: sourceOklch(family.base, ALPHA[mode].glow),
})

const accentRoles = (accent: Accent, mode: Mode): Roles =>
  accent === 'contrast' ? CONTRAST_ROLES : familyRoles(ACCENT_FAMILIES[accent], mode)

function statusRoles(): Roles {
  const roles: Roles = {}
  for (const status of STATUSES) {
    const family = ACCENT_FAMILIES[STATUS_FAMILIES[status]]
    roles[status] = sourceOklch(family.base)
    roles[`on-${status}` as const] = foregroundHex(family.foreground)
  }
  return roles
}

export function colorRoles(mode: Mode, accent: Accent, neutral: Neutral): Map<ColorRole, string> {
  const declared = new Map<string, string>(
    Object.entries({ ...neutralRoles(mode, neutral), ...accentRoles(accent, mode), ...statusRoles() }),
  )
  const value = (role: string): string => {
    const raw = declared.get(role)
    if (raw === undefined) throw new Error(`Color role ${role} has no value in ${mode} ${accent} ${neutral}`)
    return raw.replace(VARIABLE, (_, reference: string) => value(reference))
  }
  return new Map(COLOR_ROLES.map((role) => [role, value(role)]))
}

function changed(roles: Roles, base: Roles): Roles {
  const result: Roles = {}
  for (const role of COLOR_ROLES) {
    const value = roles[role]
    if (value !== undefined && value !== base[role]) result[role] = value
  }
  return result
}

const attribute = (name: string, value: string): string => `[data-${name}="${value}"]`

function rule(selector: string, roles: Roles): string[] {
  const declarations = COLOR_ROLES.flatMap((role) => {
    const value = roles[role]
    return value === undefined ? [] : [`    ${OUTPUT_PREFIX}${role}: ${value};`]
  })
  return declarations.length === 0 ? [] : [`  ${selector} {\n${declarations.join('\n')}\n  }`]
}

export function renderColorCss(): string {
  const dark = attribute('mode', 'dark')
  const darkNeutral = neutralRoles('dark', DEFAULT_NEUTRAL)
  const rules = [
    ...rule(':root', { ...neutralRoles('light', DEFAULT_NEUTRAL), ...accentRoles('contrast', 'light'), ...statusRoles() }),
    ...rule(dark, darkNeutral),
    ...NEUTRALS.filter((neutral) => neutral !== DEFAULT_NEUTRAL).flatMap((neutral) =>
      rule(dark + attribute('neutral', neutral), changed(neutralRoles('dark', neutral), darkNeutral)),
    ),
    ...ACCENT_NAMES.flatMap((name) => {
      const light = familyRoles(ACCENT_FAMILIES[name], 'light')
      return [
        ...rule(attribute('accent', name), light),
        ...rule(dark + attribute('accent', name), changed(familyRoles(ACCENT_FAMILIES[name], 'dark'), light)),
      ]
    }),
  ]
  return `@layer theme {\n${rules.join('\n\n')}\n}\n`
}

if (import.meta.main) writeFileSync(TARGET, renderColorCss())
