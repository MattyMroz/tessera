'use client'

import { useLayoutEffect, useRef, useState, type RefCallback } from 'react'
import {
  course,
  planFlight,
  SETTLED,
  visibleAt,
  type Box,
  type Flight,
  type FlightKind,
  type Point,
  type Rect,
  type ScreenAxis,
  type Size,
  type Walls,
} from './flight'
import { writeInstance } from './instance'
import { readMotion } from './motion'
import { THEME_CONFIG } from './theme'

export type Scrollport = Pick<Element, 'clientWidth' | 'clientHeight' | 'scrollLeft' | 'scrollTop'>
export type Padding = Pick<CSSStyleDeclaration, 'paddingLeft' | 'paddingTop' | 'paddingRight' | 'paddingBottom'>
export type Placement = 'reveal' | 'follow' | 'slide' | 'hide' | 'stay'
export type IndicatorSource = 'hover' | 'focus' | 'active'
export type IndicatorTargets<T> = { readonly [S in IndicatorSource]?: T | null }
export type IndicatorState<T> = { readonly target: T | null; readonly box: Box | null; readonly visible: boolean }
export type Hit<T> = { closest(selector: string): T | null }

export type IndicatorOptions = {
  readonly axis: ScreenAxis
  readonly items: string
  readonly hover?: boolean
  readonly focus?: boolean
  readonly follow?: boolean
  readonly placed?: boolean
}

export type IndicatorSelect = (active: HTMLElement | null, under: HTMLElement | null, off?: boolean) => void

export type IndicatorParts = {
  readonly container: RefCallback<HTMLElement>
  readonly ride: RefCallback<HTMLElement>
  readonly squash: RefCallback<HTMLElement>
  readonly select: IndicatorSelect
}

type IndicatorSettings = {
  readonly container: HTMLElement
  readonly ride: HTMLElement
  readonly squash: HTMLElement
  readonly axis: ScreenAxis
  readonly items: string
  readonly hover: boolean
  readonly focus: boolean
  readonly follow: boolean
  readonly placed: boolean
}

type IndicatorControl = {
  select(active: HTMLElement | null, under: HTMLElement | null, off: boolean): void
  disconnect(): void
}

type Running = { readonly flight: Flight; readonly size: Size; readonly walls: Walls; readonly animations: readonly Animation[] }

const SOURCES: readonly IndicatorSource[] = ['hover', 'focus', 'active']
const ROUNDING = 1

export function pickTarget<T extends { readonly isConnected: boolean }>(targets: IndicatorTargets<T>, under: T | null = null): T | null {
  for (const source of SOURCES) {
    const target = targets[source]
    if (!target?.isConnected) continue
    return target === under ? null : target
  }
  return null
}

export function stickyHover<T>(hit: Hit<T> | null, contains: (node: T) => boolean, items: string, current: T | null): T | null {
  const item = hit?.closest(items) ?? null
  return item !== null && contains(item) ? item : current
}

function enabled(items: string): string {
  return `:is(${items}):not(:disabled, [data-disabled], [aria-disabled='true'])`
}

export function inside(rect: Rect, x: number, y: number): boolean {
  return x > rect.left && x < rect.left + rect.width && y > rect.top && y < rect.top + rect.height
}

function frameTime(): number {
  const time = document.timeline.currentTime
  return typeof time === 'number' ? time : performance.now()
}

function near(a: Box, b: Box): boolean {
  return [a.x - b.x, a.y - b.y, a.width - b.width, a.height - b.height].every((delta) => Math.abs(delta) < SETTLED)
}

export function warm(hiddenAt: number | null, now: number, window: number): boolean {
  return hiddenAt !== null && now - hiddenAt <= window
}

export function place<T>(state: IndicatorState<T>, target: T | null, box: Box | null, warmGroup = false): Placement {
  if (target === null || box === null || box.width <= 0 || box.height <= 0) return 'hide'
  if (state.box === null) return 'reveal'
  if (!state.visible) return warmGroup ? 'slide' : 'reveal'
  if (target !== state.target) return 'slide'
  return near(state.box, box) ? 'stay' : 'follow'
}

function scaleOf(rendered: number, layout: number): number {
  return layout > 0 && Math.abs(rendered - layout) >= ROUNDING ? rendered / layout : 1
}

export function measureBox(target: Rect, container: Rect, containerLayout: Size, inset: Point): Box {
  const scaleX = scaleOf(container.width, containerLayout.width)
  const scaleY = scaleOf(container.height, containerLayout.height)
  const width = target.width / scaleX
  const height = target.height / scaleY
  const centreX = (target.left + target.width / 2 - container.left) / scaleX - inset.x
  const centreY = (target.top + target.height / 2 - container.top) / scaleY - inset.y
  return { x: centreX - width / 2, y: centreY - height / 2, width, height }
}

function measureIn(target: HTMLElement, container: HTMLElement): Box {
  return measureBox(
    target.getBoundingClientRect(),
    container.getBoundingClientRect(),
    { width: container.offsetWidth, height: container.offsetHeight },
    { x: container.clientLeft - container.scrollLeft, y: container.clientTop - container.scrollTop },
  )
}

export function wallsOf(container: Scrollport, padding: Padding, axis: ScreenAxis): Walls {
  const scroll = axis === 'x' ? container.scrollLeft : container.scrollTop
  const client = axis === 'x' ? container.clientWidth : container.clientHeight
  const start = Number.parseFloat(axis === 'x' ? padding.paddingLeft : padding.paddingTop) || 0
  const end = Number.parseFloat(axis === 'x' ? padding.paddingRight : padding.paddingBottom) || 0
  return { start: scroll + start, end: scroll + client - end }
}

function elapsedOf(animation: Animation | undefined): number {
  const time = animation?.currentTime
  return typeof time === 'number' ? time : Number.POSITIVE_INFINITY
}

function translate(point: Point): string {
  return `translate(${point.x}px, ${point.y}px)`
}

function squeeze(axis: ScreenAxis, scale: number): string {
  return axis === 'x' ? `scaleX(${scale})` : `scaleY(${scale})`
}

function connectIndicator(settings: IndicatorSettings): IndicatorControl {
  const { container, ride, squash, axis } = settings
  const kind: FlightKind = settings.hover || settings.follow ? 'follow' : 'choice'
  const items = enabled(settings.items)
  let hovered: HTMLElement | null = null
  let focused: HTMLElement | null = null
  let active: HTMLElement | null = null
  let under: HTMLElement | null = null
  let off = false
  let state: IndicatorState<HTMLElement> = { target: null, box: null, visible: false }
  let hiddenAt: number | null = null
  let fading = false
  let running: Running | undefined
  const resizes = new ResizeObserver(() => update())
  const observeCollection = (): void => {
    resizes.disconnect()
    resizes.observe(container)
    container.querySelectorAll(settings.items).forEach((item) => resizes.observe(item))
  }
  const mutations = new MutationObserver(observeCollection)
  mutations.observe(container, { childList: true, subtree: true })
  observeCollection()

  ride.setAttribute('data-axis', axis)
  ride.setAttribute('data-visible', 'false')

  const stop = (): void => {
    running?.animations.forEach((animation) => animation.cancel())
    running = undefined
  }

  const rest = (box: Box): void => {
    if (settings.placed) return
    ride.style.transform = translate(box)
    writeInstance(ride, { '--ts-i-inline-size': `${box.width}px`, '--ts-i-block-size': `${box.height}px` })
  }

  const shifted = (point: Point, box: Box): Point => (settings.placed ? { x: point.x - box.x, y: point.y - box.y } : point)

  const startFrom = (): Point => {
    const flight = running?.flight
    const elapsed = elapsedOf(running?.animations[0])
    if (running && flight && elapsed < flight.duration) return visibleAt(flight, running.size, axis, running.walls, elapsed)
    return state.box ?? { x: 0, y: 0 }
  }

  const fly = (box: Box): void => {
    const position = startFrom()
    stop()
    rest(box)
    const flight = planFlight({ kind, from: position, to: box, motion: readMotion(container) })
    if (!flight) {
      ride.removeAttribute('data-wall')
      return
    }
    const walls = wallsOf(container, getComputedStyle(container), axis)
    const { frames, wall } = course(flight, box, axis, walls)
    const timing: KeyframeAnimationOptions = { duration: flight.duration, easing: flight.easing }
    const animations = [ride.animate(frames.map((frame) => ({ offset: frame.offset, transform: translate(shifted(frame, box)) })), timing)]
    if (wall) {
      ride.setAttribute('data-wall', wall)
      animations.push(squash.animate(frames.map((frame) => ({ offset: frame.offset, transform: squeeze(axis, frame.scale) })), timing))
    } else {
      ride.removeAttribute('data-wall')
    }
    const now = document.timeline.currentTime
    if (typeof now === 'number') animations.forEach((animation) => (animation.startTime = now))
    running = { flight, size: box, walls, animations }
  }

  const update = (): void => {
    ride.toggleAttribute('data-off', off)
    const target = off ? null : pickTarget({ hover: hovered, focus: focused, active }, under)
    const box = target ? measureIn(target, container) : null
    const returning = !state.visible && state.box !== null && target !== null && warm(hiddenAt, frameTime(), fading ? readMotion(container).hoverOut : 0)
    const placement = place(state, target, box, returning)
    if (placement === 'stay') return
    if (placement === 'hide' || !target || !box) {
      if (state.visible) {
        hiddenAt = frameTime()
        fading = ride.getAttribute('data-variant') === 'hover' && !off
      }
      ride.setAttribute('data-visible', 'false')
      state = { ...state, visible: false }
      return
    }
    ride.toggleAttribute('data-return', returning)
    hiddenAt = null
    if (placement === 'slide') fly(box)
    else {
      stop()
      rest(box)
    }
    const tone = target.getAttribute('data-tone')
    if (tone === null) ride.removeAttribute('data-tone')
    else ride.setAttribute('data-tone', tone)
    ride.setAttribute('data-visible', 'true')
    state = { target, box, visible: true }
  }

  const itemIn = (node: EventTarget | null): HTMLElement | null => {
    const item = node instanceof Element ? node.closest(items) : null
    return item instanceof HTMLElement && container.contains(item) ? item : null
  }

  const isDisabledItem = (node: EventTarget | null): boolean =>
    node instanceof Element && node.closest(settings.items) !== null && node.closest(items) === null

  const contains = (node: Element): boolean => container.contains(node)
  const onMove = (event: MouseEvent): void => {
    const next = stickyHover(event.target instanceof Element ? event.target : null, contains, items, hovered)
    const item = next instanceof HTMLElement ? next : null
    if (item === hovered) return
    hovered = item
    update()
  }
  const forget = (): void => {
    document.removeEventListener('pointermove', onOutside)
    if (!hovered) return
    hovered = null
    update()
  }
  const onOutside = (event: PointerEvent): void => {
    if (!inside(container.getBoundingClientRect(), event.clientX, event.clientY)) forget()
    else if (event.target instanceof Node && container.contains(event.target)) document.removeEventListener('pointermove', onOutside)
  }
  const onLeave = (event: Event): void => {
    if (!hovered) return
    if (event instanceof PointerEvent && inside(container.getBoundingClientRect(), event.clientX, event.clientY)) {
      document.addEventListener('pointermove', onOutside)
      return
    }
    forget()
  }
  const onFocusIn = (event: FocusEvent): void => {
    if (isDisabledItem(event.target)) return
    const item = itemIn(event.target)
    focused = item?.matches(':focus-visible') ? item : null
    if (focused) hovered = null
    update()
  }
  const onFocusOut = (event: FocusEvent): void => {
    if (event.relatedTarget instanceof Node && container.contains(event.relatedTarget)) return
    focused = null
    update()
  }

  if (settings.hover) {
    container.addEventListener('pointermove', onMove)
    container.addEventListener('mousemove', onMove)
    container.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
  }
  if (settings.focus) {
    container.addEventListener('focusin', onFocusIn)
    container.addEventListener('focusout', onFocusOut)
  }
  window.addEventListener(THEME_CONFIG.changeEvent, update)

  return {
    select(nextActive, nextUnder, nextOff) {
      active = nextActive
      under = nextUnder
      off = nextOff
      update()
    },
    disconnect() {
      stop()
      resizes.disconnect()
      mutations.disconnect()
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointermove', onOutside)
      window.removeEventListener('blur', onLeave)
      container.removeEventListener('focusin', onFocusIn)
      container.removeEventListener('focusout', onFocusOut)
      window.removeEventListener(THEME_CONFIG.changeEvent, update)
    },
  }
}

export function useIndicator(options: IndicatorOptions): IndicatorParts {
  const { axis, items } = options
  const hover = options.hover ?? false
  const focus = options.focus ?? false
  const follow = options.follow ?? false
  const placed = options.placed ?? false
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [ride, setRide] = useState<HTMLElement | null>(null)
  const [squash, setSquash] = useState<HTMLElement | null>(null)
  const control = useRef<IndicatorControl | null>(null)
  const targets = useRef<{ active: HTMLElement | null; under: HTMLElement | null; off: boolean }>({ active: null, under: null, off: false })

  useLayoutEffect(() => {
    if (!container || !ride || !squash) return
    const indicator = connectIndicator({ container, ride, squash, axis, items, hover, focus, follow, placed })
    indicator.select(targets.current.active, targets.current.under, targets.current.off)
    control.current = indicator
    return () => {
      indicator.disconnect()
      control.current = null
    }
  }, [container, ride, squash, axis, items, hover, focus, follow, placed])

  const select: IndicatorSelect = (active, under, off = false) => {
    targets.current = { active, under, off }
    control.current?.select(active, under, off)
  }

  return { container: setContainer, ride: setRide, squash: setSquash, select }
}
