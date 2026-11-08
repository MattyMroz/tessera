'use client'

import { useLayoutEffect, useRef, useState, type RefCallback } from 'react'
import { SETTLED, type Point, type Rect } from './flight'
import { readMotion, type Motion } from './motion'

export function menuGrace(motion: Motion): number {
  return motion.hoverOut
}

export type FlightOrigin = { readonly rect: Rect }

export type FlightPopup = {
  readonly isConnected: boolean
  getBoundingClientRect(): Rect
  animate(keyframes: Keyframe[], options: KeyframeAnimationOptions): FlightAnimation
}

export type FlightAnimation = Pick<Animation, 'cancel' | 'playState'>

export type FlightPositioner = {
  readonly style: { readonly transform: string }
  hasAttribute(name: string): boolean
}

export type PopupFlightOptions<P extends FlightPopup> = {
  readonly grace: (motion: Motion) => number
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
export type Morph = { readonly x: number; readonly y: number; readonly scaleX: number; readonly scaleY: number }

function centre(start: number, size: number): number {
  return start + size / 2
}

export function morphFrom(from: Rect, to: Rect): Morph {
  return {
    x: centre(from.left, from.width) - centre(to.left, to.width),
    y: centre(from.top, from.height) - centre(to.top, to.height),
    scaleX: to.width > 0 ? from.width / to.width : 1,
    scaleY: to.height > 0 ? from.height / to.height : 1,
  }
}

export function morphTransform({ x, y, scaleX, scaleY }: Morph): readonly [string, string] {
  if (scaleX === 1 && scaleY === 1) return [`translate(${x}px, ${y}px)`, 'translate(0, 0)']
  return [`translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`, 'translate(0px, 0px) scale(1, 1)']
}

function settled({ x, y, scaleX, scaleY }: Morph, to: Rect): boolean {
  return [x, y, (scaleX - 1) * to.width, (scaleY - 1) * to.height].every((delta) => Math.abs(delta) < SETTLED)
}

export function flightOrigin(popup: FlightPopup | null): FlightOrigin | null {
  if (!popup?.isConnected) return null
  const { left, top, width, height } = popup.getBoundingClientRect()
  if (width <= 0 && height <= 0) return null
  return { rect: { left, top, width, height } }
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
  const { rect } = shown.target
  const left = rect.left + shown.scroll.x - scroll.x
  const top = rect.top + shown.scroll.y - scroll.y
  return { rect: { ...rect, left, top } }
}

function drifted(previous: FlightOrigin, visible: FlightOrigin | null, target: FlightOrigin): FlightOrigin {
  if (!visible) return previous
  const left = previous.rect.left + visible.rect.left - target.rect.left
  const top = previous.rect.top + visible.rect.top - target.rect.top
  return { rect: { ...previous.rect, left, top } }
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

  const recent = (positioner: FlightPositioner, popup: P, at: Point, scrolled: number): FlightOrigin | null => {
    if (!last || last.positioner === positioner || last.panes !== scrolled) return null
    return last.closedAt === null || now() - last.closedAt <= grace(motion(popup)) ? seenAt(last, at) : null
  }

  const fly = (popup: P, from: FlightOrigin | null, target: FlightOrigin): void => {
    if (!from) return
    const { follow, ease } = motion(popup)
    if (follow <= 0) return
    const morph = morphFrom(from.rect, target.rect)
    if (settled(morph, target.rect)) return
    const [start, end] = morphTransform(morph)
    const frames = [{ transform: start }, { transform: end }]
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
    if (!stays) fly(popup, known ? drifted(seenAt(same, at), visible, target) : recent(positioner, popup, at, scrolled), target)
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
  return createPopupFlight<HTMLElement>({ grace: menuGrace, motion: readMotion })
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
