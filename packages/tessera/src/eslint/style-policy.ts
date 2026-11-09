import { APP_LAYOUT, LAYOUT_CLASSES, LAYOUT_FAMILIES } from './layout'

const LAYOUT = new RegExp(`^(?:${LAYOUT_CLASSES.join('|')}|(?:${LAYOUT_FAMILIES.join('|')})-.+)$`)
const PALETTE_SHADE = /(?:^|-)((?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe)-(?:50|[1-9]00|950))$/
const COLOR_NAMES = new Set(`
  aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue
  blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk
  crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki
  darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
  darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue
  dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite
  gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki
  lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow
  lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
  lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine
  mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen
  mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy
  oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise
  palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red
  rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue
  slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise
  violet wheat white whitesmoke yellow yellowgreen transparent
`.trim().split(/\s+/))

const SAFE_NUMBER = /^(?:\d+(?:\.\d*)?|\.\d+)(?:px|rem|em|%|vw|vh|dvw|dvh|svw|svh|lvw|lvh|vmin|vmax|ch|ex|lh|cqw|cqh|cqi|cqb|cqmin|cqmax|fr)?$/
const SAFE_WORDS = new Set(`
  auto inherit initial unset none normal size inline-size scroll-state min-content max-content fit-content auto-fill
  auto-fit span subgrid dense calc min max clamp minmax repeat
`.trim().split(/\s+/))

const QUERY_WORDS = new Set(`
  @ : < > = media and or not only screen print width height min-width max-width min-height max-height aspect-ratio
  min-aspect-ratio max-aspect-ratio orientation portrait landscape
`.trim().split(/\s+/))

function safeValue(value: string, extra: ReadonlySet<string> = new Set()): boolean {
  const atoms = value.match(/[a-z]+(?:-[a-z]+)*|(?:\d+(?:\.\d*)?|\.\d+)[a-z%]*|[-+*/,()\s]|./g) ?? []
  return atoms.every((atom) => /^[-+*/,()\s]$/.test(atom) || SAFE_WORDS.has(atom) || SAFE_NUMBER.test(atom) || extra.has(atom))
}

function lastTopLevel(token: string, separator: string): number {
  let found = -1
  let depth = 0
  let quote = ''
  for (let index = 0; index < token.length; index += 1) {
    const char = token[index]
    if (char === '\\') index += 1
    else if (quote) quote = char === quote ? '' : quote
    else if (char === '"' || char === "'") quote = char
    else if (char === '[' || char === '(') depth += 1
    else if (char === ']' || char === ')') depth -= 1
    else if (char === separator && depth === 0) found = index
  }
  return found
}

function classVariants(token: string): string {
  return token.slice(0, Math.max(0, lastTopLevel(token, ':')))
}

function classBase(token: string): string {
  return token.slice(lastTopLevel(token, ':') + 1).replace(/^!/, '').replace(/!$/, '').replace(/^-/, '')
}

export function appearanceProperty(name: string): boolean {
  const property = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^-?(?:webkit|moz|ms)-/, '')
  return !APP_LAYOUT.some((family) => property === family || property.startsWith(`${family}-`))
}

export function layoutClass(token: string): boolean {
  return LAYOUT.test(classBase(token))
}

export function arbitraryProperty(token: string): boolean {
  return /^\[[\w-]+:/.test(classBase(token))
}

function variantList(token: string): string[] {
  const variants: string[] = []
  let rest = classVariants(token)
  while (rest) {
    const at = lastTopLevel(rest, ':')
    variants.push(rest.slice(at + 1))
    rest = at < 0 ? '' : rest.slice(0, at)
  }
  return variants
}

export function childVariant(token: string): boolean {
  return variantList(token).some((variant) => variant === '*' || variant === '**' || (variant.startsWith('[') && variant.includes('&')))
}

function unsafeVariant(variant: string): boolean {
  const name = variant.replace(/^(?:not-)+/, '').replace(/\/[\w-]+$/, '')
  const query = /^@?(?:min|max)-\[(.*)\]$|^@\[(.*)\]$/.exec(name)
  if (query) return !safeValue((query[1] ?? query[2] ?? '').replaceAll('_', ' '))
  if (name.startsWith('[@')) return !safeValue(name.slice(1, -1).replaceAll('_', ' '), QUERY_WORDS)
  return /--|theme\(/.test(name)
}

export function unsafeValue(token: string): boolean {
  if (/[-/]\(/.test(token.replace(/\[[^\]]*\]/g, '')) || variantList(token).some(unsafeVariant)) return true
  let base = classBase(token)
  if (/^(?:@container|group|peer)/.test(base)) base = base.replace(/\/(?:\[[\w-]+\]|[\w-]+)$/, '')
  const property = /^\[[^:\]]+:(.*)\]$/.exec(base)
  const values = property ? [property[1] ?? ''] : [...base.matchAll(/\[([^\]]*)\]/g)].map(([, value]) => value ?? '')
  return values.some((value) => !safeValue(value.replace(/^[a-z-]+:/, '').replaceAll('_', ' ')))
}

export function classColor(token: string): string | undefined {
  const base = classBase(token)
  const slash = lastTopLevel(base, '/')
  const value = slash < 0 ? base : base.slice(0, slash)
  if (/^(?:@container|group|peer|font)(?:-|$)/.test(value) || value.includes('[')) return undefined
  const name = value.slice(value.lastIndexOf('-') + 1)
  return PALETTE_SHADE.exec(value)?.[1] ?? (COLOR_NAMES.has(name) ? name : undefined)
}
