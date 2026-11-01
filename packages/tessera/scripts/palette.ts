export type Oklch = readonly [lightness: number, chroma: number, hue: number]

export type Foreground = 'white' | 'dark'

export type AccentFamily = { base: Oklch; bright: Oklch; dim: Oklch; foreground: Foreground }

export const MODES = ['light', 'dark'] as const

export type Mode = (typeof MODES)[number]

export const NEUTRALS = ['k1', 'k2', 'k3', 'k4'] as const

export type Neutral = (typeof NEUTRALS)[number]

export const ACCENT_FAMILIES = {
  red: { base: [0.637, 0.237, 25.331], bright: [0.704, 0.191, 22.216], dim: [0.505, 0.213, 27.518], foreground: 'dark' },
  orange: { base: [0.705, 0.213, 47.604], bright: [0.75, 0.183, 55.934], dim: [0.553, 0.195, 38.402], foreground: 'dark' },
  amber: { base: [0.769, 0.188, 70.08], bright: [0.828, 0.189, 84.429], dim: [0.555, 0.163, 48.998], foreground: 'dark' },
  yellow: { base: [0.795, 0.184, 86.047], bright: [0.852, 0.199, 91.936], dim: [0.554, 0.135, 66.442], foreground: 'dark' },
  lime: { base: [0.768, 0.233, 130.85], bright: [0.841, 0.238, 128.85], dim: [0.532, 0.157, 131.589], foreground: 'dark' },
  green: { base: [0.723, 0.219, 149.579], bright: [0.792, 0.209, 151.711], dim: [0.527, 0.154, 150.069], foreground: 'dark' },
  emerald: { base: [0.696, 0.17, 162.48], bright: [0.765, 0.177, 163.223], dim: [0.508, 0.118, 165.612], foreground: 'dark' },
  teal: { base: [0.704, 0.14, 182.503], bright: [0.777, 0.152, 181.912], dim: [0.511, 0.096, 186.391], foreground: 'dark' },
  cyan: { base: [0.715, 0.143, 215.221], bright: [0.789, 0.154, 211.53], dim: [0.52, 0.105, 223.128], foreground: 'dark' },
  sky: { base: [0.685, 0.169, 237.323], bright: [0.746, 0.16, 232.661], dim: [0.5, 0.134, 242.749], foreground: 'dark' },
  blue: { base: [0.623, 0.214, 259.815], bright: [0.707, 0.165, 254.624], dim: [0.488, 0.243, 264.376], foreground: 'dark' },
  indigo: { base: [0.585, 0.233, 277.117], bright: [0.673, 0.182, 276.935], dim: [0.457, 0.24, 277.023], foreground: 'white' },
  violet: { base: [0.606, 0.25, 292.717], bright: [0.702, 0.183, 293.541], dim: [0.491, 0.27, 292.581], foreground: 'dark' },
  purple: { base: [0.627, 0.265, 303.9], bright: [0.714, 0.203, 305.504], dim: [0.496, 0.265, 301.924], foreground: 'dark' },
  fuchsia: { base: [0.667, 0.295, 322.15], bright: [0.74, 0.238, 322.16], dim: [0.518, 0.253, 323.949], foreground: 'dark' },
  pink: { base: [0.656, 0.241, 354.308], bright: [0.718, 0.202, 349.761], dim: [0.525, 0.223, 3.958], foreground: 'dark' },
  rose: { base: [0.645, 0.246, 16.439], bright: [0.712, 0.194, 13.428], dim: [0.514, 0.222, 16.935], foreground: 'dark' },
  slate: { base: [0.554, 0.046, 257.417], bright: [0.704, 0.04, 256.788], dim: [0.372, 0.044, 257.287], foreground: 'white' },
  zinc: { base: [0.552, 0.016, 285.938], bright: [0.705, 0.015, 286.067], dim: [0.37, 0.013, 285.805], foreground: 'white' },
} as const satisfies Record<string, AccentFamily>

export type AccentName = keyof typeof ACCENT_FAMILIES

export type Accent = 'contrast' | AccentName

const isAccentName = (name: string): name is AccentName => name in ACCENT_FAMILIES

export const ACCENT_NAMES: readonly AccentName[] = Object.keys(ACCENT_FAMILIES).filter(isAccentName)

export const ACCENTS: readonly Accent[] = ['contrast', ...ACCENT_NAMES]

export const DEFAULT_NEUTRAL: Neutral = 'k2'

export const STATUSES = ['success', 'warning', 'danger', 'info'] as const

export type Status = (typeof STATUSES)[number]

export const STATUS_FAMILIES = { success: 'green', warning: 'orange', danger: 'red', info: 'blue' } as const satisfies Record<
  Status,
  AccentName
>

export const DARK_FOREGROUND: Oklch = [0.13, 0, 0]

export const WHITE = '#ffffff'

export const SCRIM_INK = '#000000'

export const LIGHT_NEUTRAL = {
  background: '#fdfdfe',
  'secondary-background': '#f9f9fb',
  'tertiary-background': '#ffffff',
  'raised-background': '#ffffff',
  'inverse-background': '#141417',
  chip: '#ffffff',
  tooltip: '#141417',
  label: '#141417',
  'secondary-label': '#64646d',
  'hint-label': '#64646d',
  'tertiary-label': '#a0a0a9',
  'quaternary-label': '#c9c9d0',
  'inverse-label': '#fdfdfe',
  'tooltip-label': '#fdfdfe',
  'inverse-hover': '#2c2c31',
  'inverse-press': '#3d3d42',
  thumb: '#ffffff',
  'opaque-separator': '#e1e1e6',
  ink: '#74747f',
} as const

export const DARK_LADDER = {
  background: 0.134,
  'secondary-background': 0.16,
  'tertiary-background': 0.184,
  'raised-background': 0.228,
  tooltip: 0.287,
  'opaque-separator': 0.296,
  chip: 0.343,
  'quaternary-label': 0.412,
  'tertiary-label': 0.582,
  ink: 0.637,
  'hint-label': 0.712,
  'secondary-label': 0.786,
  'inverse-press': 0.845,
  'inverse-hover': 0.8975,
  label: 0.943,
} as const

export type DarkTone = keyof typeof DARK_LADDER

export const TEXT_TONES: readonly DarkTone[] = ['ink', 'label', 'secondary-label', 'hint-label', 'tertiary-label', 'quaternary-label']

export const TEXT_CHROMA_SCALE = 1.6

export const SHIFTED_SURFACE_CEILING = 0.4

export const BLACKS = {
  k1: { hue: 286, chroma: 0.006, shift: 0 },
  k2: { hue: 286, chroma: 0, shift: 0 },
  k3: { hue: 255, chroma: 0.0085, shift: 0 },
  k4: { hue: 286, chroma: 0.004, shift: -0.03 },
} as const satisfies Record<Neutral, { hue: number; chroma: number; shift: number }>

export const ALPHA = {
  light: { separator: 0.26, 'control-border': 0.82, glow: 0.22, scrim: 0.18 },
  dark: { separator: 0.24, 'control-border': 0.74, glow: 0.45, scrim: 0.4 },
} as const satisfies Record<Mode, Record<'separator' | 'control-border' | 'glow' | 'scrim', number>>
