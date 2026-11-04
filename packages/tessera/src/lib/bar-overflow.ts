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

export function watchBarOverflow(parts: BarParts, onCount: (count: number) => void): () => void {
  const { bar, more, triggers } = parts
  const count = () => {
    const gap = Number.parseFloat(getComputedStyle(bar).columnGap) || 0
    onCount(visibleCount(triggers().map((trigger) => trigger.offsetWidth), gap, more.offsetWidth, bar.clientWidth))
  }
  const observer = new ResizeObserver(count)
  observer.observe(bar)
  observer.observe(more)
  for (const trigger of triggers()) observer.observe(trigger)
  count()
  return () => observer.disconnect()
}
