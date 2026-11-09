import { readMotion } from './motion'

export function visibleCount(widths: readonly number[], gap: number, more: number, available: number): number {
  let used = 0
  for (const [index, width] of widths.entries()) {
    used += (index === 0 ? 0 : gap) + width
    if (used + (index === widths.length - 1 ? 0 : gap + more) > available) return index
  }
  return widths.length
}

export type BarParts = {
  readonly bar: HTMLElement
  readonly more: HTMLElement
  readonly triggers: () => readonly HTMLElement[]
}

const OVERFLOW = 'data-overflow'

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
  const all = () => [...triggers(), more]
  const play = (was: Map<HTMLElement, number>) => {
    const { follow, ease } = readMotion(bar)
    if (follow <= 0) return
    const timing: KeyframeAnimationOptions = { duration: follow, easing: ease }
    const hidden = all().find((element) => was.has(element) && element.hasAttribute(OVERFLOW))
    const edge = (hidden && was.get(hidden)) ?? was.get(more) ?? 0
    for (const element of all()) {
      if (element.hasAttribute(OVERFLOW)) continue
      const old = was.get(element)
      enter(element, old ?? edge, old === undefined, timing)
    }
  }
  const count = () => {
    const gap = Number.parseFloat(getComputedStyle(bar).columnGap) || 0
    const next = visibleCount(triggers().map((trigger) => trigger.offsetWidth), gap, more.offsetWidth, bar.clientWidth)
    if (next === last) return
    const was = new Map(all().filter((element) => !element.hasAttribute(OVERFLOW)).map((element) => [element, element.getBoundingClientRect().left]))
    const first = Number.isNaN(last)
    last = next
    onCount(next)
    if (!first) queueMicrotask(() => play(was))
  }
  const observer = new ResizeObserver(count)
  observer.observe(bar)
  observer.observe(more)
  for (const trigger of triggers()) observer.observe(trigger)
  count()
  return () => observer.disconnect()
}
