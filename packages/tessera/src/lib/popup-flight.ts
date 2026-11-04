'use client'

import { useLayoutEffect, useRef, useState, type RefCallback } from 'react'
import { SETTLED, type Point, type Rect } from './flight'
import { readMotion, type Motion } from './motion'

const FLIGHT_GRACE = 150

export type FlightOrigin = { readonly rect: Rect; readonly side: string | undefined }

export type FlightPopup = {
  readonly isConnected: boolean
  readonly dataset: DOMStringMap
  getBoundingClientRect(): Rect
  animate(keyframes: Keyframe[], options: KeyframeAnimationOptions): FlightAnimation
}

export type FlightAnimation = Pick<Animation, 'cancel' | 'playState'>

export type FlightPositioner = {
  readonly style: { readonly transform: string }
  hasAttribute(name: string): boolean
}

export type PopupFlightOptions<P extends FlightPopup> = {
  readonly grace: number
  readonly motion: (popup: P) => Motion
  readonly now?: () => number
  readonly scroll?: () => Point
  readonly panes?: () => number
}

export type PopupFlight<P extends FlightPopup> = {
  update(positioner: FlightPositioner, popup: P, trigger?: string): void
  release(positioner: FlightPositioner, popup: P): void
  watch(positioner: HTMLElement, popup: P, trigger: () => string | undefined): () => void
}

export type PopupFlightParts = {
  readonly positioner: RefCallback<HTMLElement>
  readonly popup: RefCallback<HTMLElement>
}

type Shown = {
  readonly positioner: FlightPositioner
  readonly transform: string
  readonly target: FlightOrigin
  readonly scroll: Point
  readonly panes: number
  readonly trigger: string | undefined
  readonly closedAt: number | null
}

const CLOSED = 'data-closed'
const WATCHED: readonly string[] = ['style', CLOSED]
const BESIDE: ReadonlySet<string> = new Set(['left', 'right', 'inline-start', 'inline-end'])

function centre(start: number, size: number): number {
  return start + size / 2
}

function edgeGap(from: Rect, to: Rect, side: string): number {
  if (side === 'right' || side === 'inline-end') return from.left - to.left
  if (side === 'left' || side === 'inline-start') return from.left + from.width - (to.left + to.width)
  if (side === 'top') return from.top + from.height - (to.top + to.height)
  return from.top - to.top
}

function alignGap(from: Rect, to: Rect, alongX: boolean, align: string): number {
  const [fromStart, fromSize, toStart, toSize] = alongX
    ? [from.left, from.width, to.left, to.width]
    : [from.top, from.height, to.top, to.height]
  if (align === 'start') return fromStart - toStart
  if (align === 'end') return fromStart + fromSize - (toStart + toSize)
  return centre(fromStart, fromSize) - centre(toStart, toSize)
}

export function flightOffset(from: FlightOrigin, to: Rect, side = 'bottom', align = 'center'): Point {
  const beside = BESIDE.has(side)
  const across = from.side === side ? edgeGap(from.rect, to, side) : 0
  const along = alignGap(from.rect, to, !beside, align)
  return beside ? { x: across, y: along } : { x: along, y: across }
}

export function flightOrigin(popup: FlightPopup | null): FlightOrigin | null {
  if (!popup?.isConnected) return null
  const { left, top, width, height } = popup.getBoundingClientRect()
  if (width <= 0 && height <= 0) return null
  return { rect: { left, top, width, height }, side: popup.dataset.side }
}

function pageScroll(): Point {
  return { x: window.scrollX, y: window.scrollY }
}

let paneScrolls = 0
let countingPanes = false

function paneScrollCount(): number {
  if (!countingPanes) {
    countingPanes = true
    const view = globalThis.document
    view.addEventListener(
      'scroll',
      (event) => {
        if (event.target !== view) paneScrolls += 1
      },
      { capture: true, passive: true },
    )
  }
  return paneScrolls
}

function seenAt(shown: Shown, scroll: Point): FlightOrigin {
  const { rect, side } = shown.target
  const left = rect.left + shown.scroll.x - scroll.x
  const top = rect.top + shown.scroll.y - scroll.y
  return { rect: { ...rect, left, top }, side }
}

function drifted(previous: FlightOrigin, visible: FlightOrigin | null, target: FlightOrigin): FlightOrigin {
  if (!visible) return previous
  const left = previous.rect.left + visible.rect.left - target.rect.left
  const top = previous.rect.top + visible.rect.top - target.rect.top
  return { rect: { ...previous.rect, left, top }, side: previous.side }
}

export function createPopupFlight<P extends FlightPopup>(options: PopupFlightOptions<P>): PopupFlight<P> {
  const { grace, motion, now = () => performance.now(), scroll = pageScroll, panes = paneScrollCount } = options
  const running = new WeakMap<P, FlightAnimation>()
  let last: Shown | null = null

  const stop = (popup: P): void => {
    running.get(popup)?.cancel()
    running.delete(popup)
  }

  const release = (positioner: FlightPositioner, popup: P): void => {
    stop(popup)
    if (last?.positioner === positioner && last.closedAt === null) last = { ...last, closedAt: now() }
  }

  const recent = (positioner: FlightPositioner, at: Point, scrolled: number): FlightOrigin | null => {
    if (!last || last.positioner === positioner || last.panes !== scrolled) return null
    return last.closedAt === null || now() - last.closedAt <= grace ? seenAt(last, at) : null
  }

  const fly = (popup: P, from: FlightOrigin | null, target: FlightOrigin): void => {
    if (!from) return
    const { follow, ease } = motion(popup)
    if (follow <= 0) return
    const offset = flightOffset(from, target.rect, target.side, popup.dataset.align)
    if (Math.abs(offset.x) < SETTLED && Math.abs(offset.y) < SETTLED) return
    const frames = [{ transform: `translate(${offset.x}px, ${offset.y}px)` }, { transform: 'translate(0, 0)' }]
    running.set(popup, popup.animate(frames, { duration: follow, easing: ease }))
  }

  const flying = (popup: P): boolean => running.get(popup)?.playState === 'running'

  const update = (positioner: FlightPositioner, popup: P, trigger?: string): void => {
    if (positioner.hasAttribute(CLOSED)) {
      release(positioner, popup)
      return
    }
    const transform = positioner.style.transform
    if (transform === '') return
    const same = last?.positioner === positioner ? last : null
    if (same?.transform === transform) {
      if (same.closedAt !== null) last = { ...same, closedAt: null }
      return
    }
    const stays = same !== null && same.trigger === trigger && !flying(popup)
    const visible = flightOrigin(popup)
    stop(popup)
    const target = flightOrigin(popup)
    if (!target) return
    const at = scroll()
    const scrolled = panes()
    const known = same !== null && same.panes === scrolled
    if (!stays) fly(popup, known ? drifted(seenAt(same, at), visible, target) : recent(positioner, at, scrolled), target)
    last = { positioner, transform, target, scroll: at, panes: scrolled, trigger, closedAt: null }
  }

  return {
    update,
    release,
    watch(positioner, popup, trigger) {
      const observer = new MutationObserver(() => update(positioner, popup, trigger()))
      observer.observe(positioner, { attributes: true, attributeFilter: [...WATCHED] })
      update(positioner, popup, trigger())
      return () => {
        observer.disconnect()
        release(positioner, popup)
      }
    },
  }
}

export function createMenuFlight(): PopupFlight<HTMLElement> {
  return createPopupFlight<HTMLElement>({ grace: FLIGHT_GRACE, motion: readMotion })
}

export function usePopupFlight(flight: PopupFlight<HTMLElement>, trigger?: string): PopupFlightParts {
  const [positioner, setPositioner] = useState<HTMLElement | null>(null)
  const [popup, setPopup] = useState<HTMLElement | null>(null)
  const currentTrigger = useRef(trigger)

  useLayoutEffect(() => {
    currentTrigger.current = trigger
  }, [trigger])

  useLayoutEffect(() => {
    if (!positioner || !popup) return
    return flight.watch(positioner, popup, () => currentTrigger.current)
  }, [flight, positioner, popup])

  return { positioner: setPositioner, popup: setPopup }
}
