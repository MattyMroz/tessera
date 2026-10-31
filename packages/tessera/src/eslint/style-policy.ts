export const LAYOUT_CLASSES = [
  'block', 'inline', 'flex(?:-.+)?', 'grid(?:-.+)?', 'table(?:-.+)?', 'contents', 'flow-root', 'list-item', 'hidden',
  'static', 'fixed', 'absolute', 'relative', 'sticky', 'isolate', 'isolation-auto', 'container', 'sr-only', 'not-sr-only',
  'visible', 'invisible', 'collapse', 'truncate', 'transform-(?:gpu|cpu|none)', 'scroll-(?:auto|smooth)', 'resize(?:-.+)?',
  'grow(?:-.+)?', 'shrink(?:-.+)?', 'box-(?:border|content)', 'caption-(?:top|bottom)', '(?:group|peer)(?:/.+)?',
  '@container(?:-(?:normal|size|[[].+))?(?:/.+)?',
  'content-(?:normal|center|start|end|between|around|evenly|baseline|stretch|center-safe|end-safe)',
  'text-(?:left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)',
  'border-(?:collapse|separate|spacing(?:-.+)?)',
]
export const LAYOUT_FAMILIES = [
  'p(?:[xytrblse]|b[se])?', 'm(?:[xytrblse]|b[se])?', 'scroll-[mp](?:[xytrblse]|b[se])?', 'space-[xy]', 'gap(?:-[xy])?',
  'size', 'w', 'h', 'block', 'inline', 'min', 'max', 'inset(?!-(?:ring|shadow))', 'top', 'right', 'bottom', 'left', 'start',
  'end', 'z', 'overflow', 'overscroll', 'order', 'col', 'row', 'basis', 'auto-cols', 'auto-rows', 'place', 'justify', 'items',
  'self', 'aspect', 'columns', 'float', 'clear', 'whitespace', 'break', 'wrap', 'hyphens', 'translate', 'origin',
  'pointer-events', 'cursor', 'select', 'touch', 'snap', 'scrollbar-gutter', 'will-change', 'contain', 'field-sizing',
  'object', 'line-clamp', 'align',
]
const LAYOUT = new RegExp(`^(?:${LAYOUT_CLASSES.join('|')}|(?:${LAYOUT_FAMILIES.join('|')})-.+)$`)
const LAYOUT_PROPERTIES = [
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'inline-size', 'block-size', 'min-inline-size',
  'max-inline-size', 'min-block-size', 'max-block-size', 'aspect-ratio', 'box-sizing', 'position', 'inset', 'top', 'right',
  'bottom', 'left', 'z-index', 'display', 'visibility', 'flex', 'grid', 'gap', 'row-gap', 'column-gap', 'order', 'align',
  'justify', 'place', 'margin', 'padding', 'overflow', 'overscroll-behavior', 'transform', 'translate', 'pointer-events',
  'cursor', 'user-select', 'touch-action', 'contain', 'will-change', 'scroll-margin', 'scroll-padding', 'scroll-snap',
  'object-fit', 'object-position', 'text-align', 'white-space', 'word-break', 'hyphens', 'text-wrap', 'text-overflow',
  'line-clamp', 'vertical-align', 'float', 'clear', 'columns', 'column-count', 'column-width', 'column-span',
  'table-layout', 'border-collapse', 'border-spacing', 'caption-side', 'resize', 'scrollbar-gutter', 'container',
  'isolation', 'field-sizing', 'scroll-behavior', 'break-before', 'break-after', 'break-inside', 'box-orient',
]
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

// Units and words a layout value may use. Anything else in brackets reads a token or paints, so it is refused
// without having to recognise it; a real need is an eslint-disable comment with the reason.
const SAFE_NUMBER = /^(?:\d+(?:\.\d*)?|\.\d+)(?:px|rem|em|%|vw|vh|dvw|dvh|svw|svh|lvw|lvh|vmin|vmax|ch|ex|lh|cqw|cqh|cqi|cqb|cqmin|cqmax|fr)?$/
const SAFE_WORDS = new Set(`
  auto inherit initial unset none normal size inline-size scroll-state min-content max-content fit-content auto-fill
  auto-fit span subgrid dense calc min max clamp minmax repeat
`.trim().split(/\s+/))

// An arbitrary at-rule variant may only ask about the viewport size.
const QUERY_WORDS = new Set(`
  @ : < > = media and or not only screen print width height min-width max-width min-height max-height aspect-ratio
  min-aspect-ratio max-aspect-ratio orientation portrait landscape
`.trim().split(/\s+/))

// Atoms are read one after another without backtracking, so a long refused value costs no more than its length.
function safeValue(value: string, extra: ReadonlySet<string> = new Set()): boolean {
  const atoms = value.match(/[a-z]+(?:-[a-z]+)*|(?:\d+(?:\.\d*)?|\.\d+)[a-z%]*|[-+*/,()\s]|./g) ?? []
  return atoms.every((atom) => /^[-+*/,()\s]$/.test(atom) || SAFE_WORDS.has(atom) || SAFE_NUMBER.test(atom) || extra.has(atom))
}

// Quotes may hold ":" or brackets as plain text, so splitting a class keeps them whole.
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
  return !LAYOUT_PROPERTIES.some((family) => property === family || property.startsWith(`${family}-`))
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

// A size query, also negated with not-, reads its value like a layout value; any other variant (data-[state=open],
// [&>svg], supports-[display:grid]) holds a selector or condition that may not read a property at all.
function unsafeVariant(variant: string): boolean {
  const name = variant.replace(/^(?:not-)+/, '').replace(/\/[\w-]+$/, '')
  const query = /^@?(?:min|max)-\[(.*)\]$|^@\[(.*)\]$/.exec(name)
  if (query) return !safeValue((query[1] ?? query[2] ?? '').replaceAll('_', ' '))
  if (name.startsWith('[@')) return !safeValue(name.slice(1, -1).replaceAll('_', ' '), QUERY_WORDS)
  return /--|theme\(/.test(name)
}

// A bracket value outside the layout grammar, also of an arbitrary property or a size query variant, or the (--x)
// shorthand that always reads a custom property.
export function unsafeValue(token: string): boolean {
  if (/[-/]\(/.test(token.replace(/\[[^\]]*\]/g, '')) || variantList(token).some(unsafeVariant)) return true
  let base = classBase(token)
  // Only a plain container, group or peer name after "/" is a name; [var(--x)] there still reads a property.
  if (/^(?:@container|group|peer)/.test(base)) base = base.replace(/\/(?:\[[\w-]+\]|[\w-]+)$/, '')
  const property = /^\[[^:\]]+:(.*)\]$/.exec(base)
  const values = property ? [property[1] ?? ''] : [...base.matchAll(/\[([^\]]*)\]/g)].map(([, value]) => value ?? '')
  return values.some((value) => !safeValue(value.replace(/^[a-z-]+:/, '').replaceAll('_', ' ')))
}

export function classColor(token: string): string | undefined {
  const base = classBase(token)
  const slash = lastTopLevel(base, '/')
  // After "/" comes an opacity modifier or a group, peer or container name, never the color itself.
  const value = slash < 0 ? base : base.slice(0, slash)
  if (/^(?:@container|group|peer|font)(?:-|$)/.test(value) || value.includes('[')) return undefined
  const name = value.slice(value.lastIndexOf('-') + 1)
  return PALETTE_SHADE.exec(value)?.[1] ?? (COLOR_NAMES.has(name) ? name : undefined)
}
