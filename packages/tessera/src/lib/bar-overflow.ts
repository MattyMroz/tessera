import { readMotion } from './motion'

export function visibleCount(widths: readonly number[], gap: number, more: number, available: number): number {
  let used = 0
  for (const [index, width] of widths.entries()) {
    const placed = index === 0 ? width : used + gap + width
    const reserve = index === widths.length - 1 ? 0 : gap + more
    if (placed + reserve > available) return index
    used = placed
  }
  return widths.length
}

export type BarParts = {
  readonly bar: HTMLElement
  readonly more: HTMLElement
  readonly triggers: () => readonly HTMLElement[]
}

type Seen = { readonly left: number; readonly shown: boolean }

const OVERFLOW = 'data-overflow'

function seenOf(element: HTMLElement): Seen {
  return { left: element.getBoundingClientRect().left, shown: !element.hasAttribute(OVERFLOW) }
}

function enter(element: HTMLElement, from: number, appear: boolean, timing: KeyframeAnimationOptions): void {
  const shift = from - element.getBoundingClientRect().left
  if (Math.abs(shift) < 1 && !appear) return
  const start: Keyframe = { transform: `translateX(${shift}px)` }
  if (appear) start.opacity = 0
  const frames = [start, { transform: 'none', opacity: 1 }]
  element.animate(frames, { ...timing, pseudoElement: '::before' })
  for (const part of element.children) part.animate(frames, timing)
}

export function watchBarOverflow(parts: BarParts, onCount: (count: number) => void): () => void {
  const { bar, more, triggers } = parts
  let last = Number.NaN
  let before: Map<HTMLElement, Seen> | null = null
  const all = () => [...triggers(), more]
  const count = () => {
    const gap = Number.parseFloat(getComputedStyle(bar).columnGap) || 0
    const next = visibleCount(triggers().map((trigger) => trigger.offsetWidth), gap, more.offsetWidth, bar.clientWidth)
    if (next === last) return
    if (!Number.isNaN(last)) before = new Map(all().map((element) => [element, seenOf(element)]))
    last = next
    onCount(next)
  }
  const play = () => {
    const was = before
    before = null
    if (was === null) return
    const { follow, ease } = readMotion(bar)
    if (follow <= 0) return
    const timing: KeyframeAnimationOptions = { duration: follow, easing: ease }
    const hidden = all().filter((element) => was.get(element)?.shown === true && element.hasAttribute(OVERFLOW))
    const edge = (hidden[0] && was.get(hidden[0])?.left) ?? was.get(more)?.left ?? 0
    for (const element of all()) {
      const old = was.get(element)
      if (old === undefined || element.hasAttribute(OVERFLOW)) continue
      if (old.shown) enter(element, old.left, false, timing)
      else enter(element, element === more ? edge : (was.get(more)?.left ?? edge), true, timing)
    }
  }
  const settled = new MutationObserver(play)
  settled.observe(bar, { attributes: true, attributeFilter: [OVERFLOW], subtree: true })
  const observer = new ResizeObserver(count)
  observer.observe(bar)
  observer.observe(more)
  for (const trigger of triggers()) observer.observe(trigger)
  count()
  return () => {
    observer.disconnect()
    settled.disconnect()
  }
}
