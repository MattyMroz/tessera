export const TYPEAHEAD_RESET = 500

export type CollectionItem = { readonly name: string; readonly disabled: boolean }
export type Orientation = 'horizontal' | 'vertical' | 'both'
export type Direction = 'ltr' | 'rtl'
export type Typeahead = { readonly text: string; readonly at: number }

export type CollectionKey = {
  readonly items: readonly CollectionItem[]
  readonly current: number
  readonly key: string
  readonly orientation: Orientation
  readonly direction: Direction
  readonly typeahead: Typeahead
  readonly now: number
}

export type CollectionMove = { readonly index: number | undefined; readonly typeahead: Typeahead }

export const NO_TYPEAHEAD: Typeahead = { text: '', at: Number.NEGATIVE_INFINITY }

const FORWARD = 1
const BACKWARD = -1
const VERTICAL_STEPS: Readonly<Record<string, number>> = { ArrowDown: FORWARD, ArrowUp: BACKWARD }

function horizontalSteps(direction: Direction): Readonly<Record<string, number>> {
  const right = direction === 'rtl' ? BACKWARD : FORWARD
  return { ArrowRight: right, ArrowLeft: -right }
}

function stepOf(key: string, orientation: Orientation, direction: Direction): number | undefined {
  if (orientation !== 'horizontal' && Object.hasOwn(VERTICAL_STEPS, key)) return VERTICAL_STEPS[key]
  const horizontal = horizontalSteps(direction)
  if (orientation !== 'vertical' && Object.hasOwn(horizontal, key)) return horizontal[key]
  return undefined
}

function enabledFrom(items: readonly CollectionItem[], start: number, step: number): number | undefined {
  const count = items.length
  for (let offset = 0; offset < count; offset++) {
    const index = (((start + offset * step) % count) + count) % count
    if (!items[index]?.disabled) return index
  }
  return undefined
}

function stepFrom(items: readonly CollectionItem[], current: number, step: number): number | undefined {
  if (current < 0) return enabledFrom(items, step > 0 ? 0 : items.length - 1, step)
  return enabledFrom(items, current + step, step)
}

function typed(key: string, typeahead: Typeahead, now: number): Typeahead | undefined {
  const fresh = now - typeahead.at > TYPEAHEAD_RESET ? '' : typeahead.text
  if (key.length !== 1 || (key === ' ' && fresh === '')) return undefined
  return { text: fresh + key.toLocaleLowerCase(), at: now }
}

function match(items: readonly CollectionItem[], current: number, text: string): number | undefined {
  const repeated = [...text].every((letter) => letter === text[0])
  const search = repeated ? text.slice(0, 1) : text
  const start = search.length === 1 ? current + 1 : Math.max(current, 0)
  const count = items.length
  for (let offset = 0; offset < count; offset++) {
    const index = (start + offset) % count
    const item = items[index]
    if (item && !item.disabled && item.name.trim().toLocaleLowerCase().startsWith(search)) return index
  }
  return undefined
}

export function moveInCollection({ items, current, key, orientation, direction, typeahead, now }: CollectionKey): CollectionMove {
  if (items.length === 0) return { index: undefined, typeahead }
  if (key === 'Home') return { index: enabledFrom(items, 0, FORWARD), typeahead: NO_TYPEAHEAD }
  if (key === 'End') return { index: enabledFrom(items, items.length - 1, BACKWARD), typeahead: NO_TYPEAHEAD }
  const step = stepOf(key, orientation, direction)
  if (step !== undefined) return { index: stepFrom(items, current, step), typeahead: NO_TYPEAHEAD }
  const next = typed(key, typeahead, now)
  if (!next) return { index: undefined, typeahead }
  const index = match(items, current, next.text)
  return { index: index === current ? undefined : index, typeahead: next }
}
