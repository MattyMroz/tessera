import type { Point, Rect } from './flight'

export const SUBMENU_REST = 100

const HEADING_SAMPLE = 4

export type SubmenuIntent = 'switch' | 'wait' | 'stay'

export type SubmenuStore<T> = {
  trigger(): T | null
  popup(): T | null
  open(trigger: T | null): void
  close(trigger: T): void
  place(popup: T): void
  leave(popup: T): void
  subscribe(listener: () => void): () => void
}

function between(value: number, start: number, end: number): boolean {
  return value >= start && value <= end
}

export function headingInto(from: Point, to: Point, rect: Rect, side: string | undefined): boolean {
  const deltaX = to.x - from.x
  const deltaY = to.y - from.y
  const right = rect.left + rect.width
  const bottom = rect.top + rect.height
  if (side === 'left') return to.x <= right || (deltaX < 0 && between(to.y + (deltaY * (right - to.x)) / deltaX, rect.top, bottom))
  if (side === 'top') return to.y <= bottom || (deltaY < 0 && between(to.x + (deltaX * (bottom - to.y)) / deltaY, rect.left, right))
  if (side === 'bottom') return to.y >= rect.top || (deltaY > 0 && between(to.x + (deltaX * (rect.top - to.y)) / deltaY, rect.left, right))
  return to.x >= rect.left || (deltaX > 0 && between(to.y + (deltaY * (rect.left - to.x)) / deltaX, rect.top, bottom))
}

export function submenuIntent<T>({ row, open, heading }: { readonly row: T | null; readonly open: T | null; readonly heading: boolean }): SubmenuIntent {
  if (row === null || row === open) return 'stay'
  return open !== null && heading ? 'wait' : 'switch'
}

export function createSubmenuStore<T>(): SubmenuStore<T> {
  const listeners = new Set<() => void>()
  let trigger: T | null = null
  let popup: T | null = null
  const open = (next: T | null): void => {
    if (next === trigger) return
    trigger = next
    listeners.forEach((listener) => listener())
  }
  return {
    trigger: () => trigger,
    popup: () => popup,
    open,
    close(current) {
      if (trigger === current) open(null)
    },
    place(next) {
      popup = next
    },
    leave(gone) {
      if (popup === gone) popup = null
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export type MenuPointerOptions = {
  readonly items: string
  readonly submenus: SubmenuStore<HTMLElement>
  readonly show: (row: HTMLElement | null) => void
}

export function watchMenuPointer(menu: Element, { items, submenus, show }: MenuPointerOptions): () => void {
  let row: HTMLElement | null = null
  let pending: HTMLElement | null = null
  let sample: Point | null = null
  let heading = false
  let rest: number | undefined

  const ownRow = (target: EventTarget | null): HTMLElement | null => {
    const found = target instanceof Element ? target.closest<HTMLElement>(items) : null
    if (!found || !menu.contains(found) || found.matches("[data-disabled], [aria-disabled='true']")) return null
    return found
  }
  const paint = (): void => show(submenus.trigger() ?? row)
  const choose = (next: HTMLElement): void => {
    window.clearTimeout(rest)
    pending = null
    row = next
    submenus.open(next.hasAttribute('aria-haspopup') ? next : null)
    paint()
  }
  const track = (point: Point): void => {
    const popup = submenus.popup()
    if (!popup || !submenus.trigger() || !sample) {
      sample = point
      heading = false
      return
    }
    if (Math.hypot(point.x - sample.x, point.y - sample.y) < HEADING_SAMPLE) return
    heading = headingInto(sample, point, popup.getBoundingClientRect(), popup.dataset.side)
    sample = point
  }
  const restart = (): void => {
    window.clearTimeout(rest)
    if (!pending) return
    rest = window.setTimeout(() => {
      if (pending) choose(pending)
    }, SUBMENU_REST)
  }
  const onMove = (event: Event): void => {
    if (!(event instanceof PointerEvent) || event.pointerType !== 'mouse') return
    track({ x: event.clientX, y: event.clientY })
    const over = ownRow(event.target)
    const intent = submenuIntent({ row: over, open: submenus.trigger(), heading })
    if (intent === 'stay') {
      if (over && over === submenus.trigger()) pending = null
      restart()
      return
    }
    if (intent === 'wait' && over) {
      pending = over
      restart()
      return
    }
    heading = false
    if (over) choose(over)
  }
  const onLeave = (): void => {
    window.clearTimeout(rest)
    pending = null
    row = null
    paint()
  }
  const stop = submenus.subscribe(paint)
  if (submenus.trigger()) paint()

  menu.addEventListener('pointermove', onMove, { passive: true })
  menu.addEventListener('pointerleave', onLeave)
  window.addEventListener('blur', onLeave)
  return () => {
    window.clearTimeout(rest)
    stop()
    menu.removeEventListener('pointermove', onMove)
    menu.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('blur', onLeave)
  }
}
