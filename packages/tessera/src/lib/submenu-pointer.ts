'use client'

import { useLayoutEffect, useState, useSyncExternalStore } from 'react'
import type { Point, Rect } from './flight'

export const SUBMENU_REST = 100

export type RowShow = (row: HTMLElement | null, under: null) => void

const HEADING_SAMPLE = 4

export type SubmenuStore<T> = {
  trigger(): T | null
  open(trigger: T | null): void
  close(trigger: T): void
  subscribe(listener: () => void): () => void
}

function between(value: number, start: number, end: number): boolean {
  return value >= start && value <= end
}

export function headingInto(from: Point, to: Point, rect: Rect, side: string | undefined): boolean {
  const leftward = side === 'left' || side === 'inline-start'
  const edge = leftward ? rect.left + rect.width : rect.left
  const deltaX = to.x - from.x
  if (leftward ? to.x <= edge : to.x >= edge) return true
  if (leftward ? deltaX >= 0 : deltaX <= 0) return false
  return between(to.y + ((to.y - from.y) * (edge - to.x)) / deltaX, rect.top, rect.top + rect.height)
}

export function createSubmenuStore<T>(): SubmenuStore<T> {
  const listeners = new Set<() => void>()
  let trigger: T | null = null
  const open = (next: T | null): void => {
    if (next === trigger) return
    trigger = next
    listeners.forEach((listener) => listener())
  }
  return {
    trigger: () => trigger,
    open,
    close(current) {
      if (trigger === current) open(null)
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
  readonly show: RowShow
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
  const paint = (): void => show(submenus.trigger() ?? row, null)
  const choose = (next: HTMLElement): void => {
    window.clearTimeout(rest)
    pending = null
    row = next
    submenus.open(next.hasAttribute('aria-haspopup') ? next : null)
    paint()
  }
  const track = (point: Point): void => {
    const id = submenus.trigger()?.getAttribute('aria-controls')
    const popup = id ? menu.ownerDocument.getElementById(id) : null
    if (!popup || !sample) {
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
    const open = submenus.trigger()
    if (!over || over === open) {
      if (over) pending = null
      restart()
      return
    }
    if (open && heading) {
      pending = over
      restart()
      return
    }
    heading = false
    choose(over)
  }
  const onLeave = (): void => {
    window.clearTimeout(rest)
    pending = null
    row = null
    paint()
  }
  const stop = submenus.subscribe(paint)
  paint()

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

const CLOSED = (): boolean => false
const POINTER_REASONS: readonly string[] = ['focus-out', 'sibling-open']

export function useMenuPointer(items: string, submenus: SubmenuStore<HTMLElement>, show: RowShow): (menu: Element | null) => void {
  const [menu, setMenu] = useState<Element | null>(null)
  useLayoutEffect(() => {
    if (!menu) return
    return watchMenuPointer(menu, { items, submenus, show })
  }, [menu, items, submenus, show])
  return setMenu
}

export function useSubmenu<D extends { readonly reason: string }>(
  submenus: SubmenuStore<HTMLElement>,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean, details: D) => void) | undefined,
) {
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const open = useSyncExternalStore(submenus.subscribe, () => trigger !== null && submenus.trigger() === trigger, CLOSED)
  useLayoutEffect(() => {
    if (trigger && defaultOpen) submenus.open(trigger)
  }, [submenus, trigger, defaultOpen])
  const change = (next: boolean, details: D): void => {
    if (!next && POINTER_REASONS.includes(details.reason)) return
    if (trigger) {
      if (next) submenus.open(trigger)
      else submenus.close(trigger)
    }
    onOpenChange?.(next, details)
  }
  return { open, change, setTrigger }
}
