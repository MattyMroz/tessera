'use client'

import type { ReactNode } from 'react'
import type { Rect } from './flight'
import { writeInstance } from './instance'
import { copyScope } from './scope'

export const TOOLTIP_OPEN_DELAY = 400

export const TOOLTIP_GROUP_GRACE = 400

export const TOOLTIP_CLOSE_DELAY = 100

export type TipSide = 'top' | 'bottom' | 'left' | 'right'

export type TipSize = { readonly width: number; readonly height: number }

export type TipPlace = { readonly side: TipSide; readonly x: number; readonly y: number; readonly arrow: number }

export type TipShown = { readonly content: ReactNode; readonly previous: ReactNode; readonly turn: number }

type Entry = 'appear' | 'instant' | 'move'

const FLIP: Readonly<Record<TipSide, TipSide>> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
const LABEL = "[data-slot='label']:not([data-leaving])"
const LEAVING = "[data-slot='label'][data-leaving]"
const ENTERING = 'data-entering'
const OPEN = 'data-open'
const SNAP = 'data-snap'
const INSTANT = 'data-instant'
const DESCRIBED = 'aria-describedby'
const TOUCH = 'touch'
const LAYOUT_UNITS = 64
const ESCAPE = 'Escape'
const HIDDEN: TipShown = { content: null, previous: null, turn: 0 }

function centre(start: number, size: number): number {
  return start + size / 2
}

function within(start: number, size: number, edge: number, room: number): number {
  if (room - edge * 2 <= size) return (room - size) / 2
  return Math.min(Math.max(start, edge), room - edge - size)
}

function fits(side: TipSide, trigger: Rect, size: TipSize, gap: number, view: TipSize): boolean {
  if (side === 'top') return trigger.top - gap - size.height >= gap
  if (side === 'bottom') return trigger.top + trigger.height + gap + size.height <= view.height - gap
  if (side === 'left') return trigger.left - gap - size.width >= gap
  return trigger.left + trigger.width + gap + size.width <= view.width - gap
}

export function placeTip(trigger: Rect, size: TipSize, gap: number, view: TipSize, wanted: TipSide): TipPlace {
  const side = fits(wanted, trigger, size, gap, view) || !fits(FLIP[wanted], trigger, size, gap, view) ? wanted : FLIP[wanted]
  if (side === 'top' || side === 'bottom') {
    const middle = centre(trigger.left, trigger.width)
    const x = within(middle - size.width / 2, size.width, gap, view.width)
    const y = side === 'top' ? trigger.top - gap - size.height : trigger.top + trigger.height + gap
    return { side, x, y, arrow: middle - x }
  }
  const middle = centre(trigger.top, trigger.height)
  const y = within(middle - size.height / 2, size.height, gap, view.height)
  const x = side === 'left' ? trigger.left - gap - size.width : trigger.left + trigger.width + gap
  return { side, x, y, arrow: middle - y }
}

let current: TipGroup | null = null
let hiddenAt = Number.NEGATIVE_INFINITY

function warm(): boolean {
  return current !== null || performance.now() - hiddenAt <= TOOLTIP_GROUP_GRACE
}

function pixels(value: string): number {
  const amount = Number.parseFloat(value)
  return Number.isFinite(amount) ? amount : 0
}

type TriggerEvent = { readonly currentTarget: HTMLElement; readonly pointerType?: string; readonly key?: string }

export type TipTriggerProps = {
  readonly 'data-tooltip-trigger': ''
  readonly onPointerEnter: (event: TriggerEvent) => void
  readonly onPointerLeave: (event: TriggerEvent) => void
  readonly onPointerDown: (event: TriggerEvent) => void
  readonly onFocus: (event: TriggerEvent) => void
  readonly onBlur: () => void
  readonly onKeyDown: (event: TriggerEvent) => void
}

export type TipGroup = {
  readonly subscribe: (listener: () => void) => () => void
  readonly shown: () => TipShown
  readonly attach: (bubble: HTMLElement | null) => void
  readonly describe: (trigger: HTMLElement, content: ReactNode) => void
  readonly trigger: TipTriggerProps
  readonly enterGroup: () => void
  readonly leaveGroup: () => void
  readonly hide: () => void
  readonly placed: () => void
}

export type TipGroupOptions = {
  readonly side: () => TipSide
  readonly heldByGroup: boolean
}

export function createTipGroup(options: TipGroupOptions): TipGroup {
  const listeners = new Set<() => void>()
  const contents = new WeakMap<HTMLElement, ReactNode>()
  let bubble: HTMLElement | null = null
  let target: HTMLElement | null = null
  let entry: Entry = 'appear'
  let state: TipShown = HIDDEN
  let pressed: HTMLElement | null = null
  let opening: number | undefined
  let closing: number | undefined
  let fading = 0

  const notify = (): void => {
    for (const listener of listeners) listener()
  }

  const clearTimers = (): void => {
    window.clearTimeout(opening)
    window.clearTimeout(closing)
  }

  const onScroll = (): void => group.hide()

  const show = (trigger: HTMLElement, next: Entry): void => {
    clearTimers()
    if (current && current !== group) current.hide()
    if (target && target !== trigger) target.removeAttribute(DESCRIBED)
    target = trigger
    entry = next
    fading += 1
    current = group
    document.addEventListener('scroll', onScroll, { capture: true, passive: true, once: true })
    state = { content: contents.get(trigger) ?? null, previous: next === 'move' ? state.content : null, turn: state.turn + 1 }
    notify()
  }

  const begin = (trigger: HTMLElement, keyboard: boolean): void => {
    if (pressed === trigger) return
    window.clearTimeout(closing)
    if (current === group && target !== null && bubble?.hasAttribute(OPEN)) {
      if (target !== trigger) show(trigger, 'move')
      return
    }
    if (keyboard || warm()) {
      show(trigger, 'instant')
      return
    }
    window.clearTimeout(opening)
    opening = window.setTimeout(() => show(trigger, 'appear'), TOOLTIP_OPEN_DELAY)
  }

  const later = (): void => {
    window.clearTimeout(opening)
    window.clearTimeout(closing)
    closing = window.setTimeout(() => group.hide(), TOOLTIP_CLOSE_DELAY)
  }

  const group: TipGroup = {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    shown: () => state,
    attach(element) {
      bubble = element
    },
    describe(trigger, content) {
      contents.set(trigger, content)
    },
    trigger: {
      'data-tooltip-trigger': '',
      onPointerEnter({ currentTarget, pointerType }) {
        if (pointerType !== TOUCH) begin(currentTarget, false)
      },
      onPointerLeave({ currentTarget }) {
        if (pressed === currentTarget) pressed = null
        window.clearTimeout(opening)
        if (!options.heldByGroup) later()
      },
      onPointerDown({ currentTarget }) {
        pressed = currentTarget
        group.hide()
      },
      onFocus({ currentTarget }) {
        if (currentTarget.matches(':focus-visible')) begin(currentTarget, true)
      },
      onBlur: () => group.hide(),
      onKeyDown({ key }) {
        if (key === ESCAPE) group.hide()
      },
    },
    enterGroup() {
      window.clearTimeout(closing)
    },
    leaveGroup: later,
    hide() {
      clearTimers()
      if (current !== group) return
      current = null
      hiddenAt = performance.now()
      target?.removeAttribute(DESCRIBED)
      target = null
      const element = bubble
      if (!element) return
      element.removeAttribute(OPEN)
      const turn = fading
      void Promise.allSettled(element.getAnimations().map((animation) => animation.finished)).then(() => {
        if (turn !== fading || current === group) return
        if (element.matches(':popover-open')) element.hidePopover()
        state = HIDDEN
        notify()
      })
    },
    placed() {
      const element = bubble
      const trigger = target
      if (!element || !trigger || current !== group) return
      copyScope(trigger, element)
      if (!element.matches(':popover-open')) element.showPopover()
      const label = element.querySelector<HTMLElement>(LABEL)
      if (!label) return
      element.dataset.side ??= options.side()
      const style = getComputedStyle(element)
      const clip = label.parentElement
      if (!clip) return
      const chrome = element.getBoundingClientRect().width - clip.getBoundingClientRect().width
      const gap = pixels(style.marginBottom)
      writeInstance(label, { '--ts-i-tip-room': `${window.innerWidth - gap * 2 - chrome}px` })
      const width = (Math.ceil((label.getBoundingClientRect().width + chrome) * LAYOUT_UNITS) + 1) / LAYOUT_UNITS
      const height = pixels(style.height)
      const place = placeTip(trigger.getBoundingClientRect(), { width, height }, gap, { width: window.innerWidth, height: window.innerHeight }, options.side())
      element.toggleAttribute(SNAP, entry !== 'move')
      element.toggleAttribute(INSTANT, entry === 'instant')
      if (entry === 'instant') element.setAttribute(OPEN, '')
      element.dataset.side = place.side
      writeInstance(element, {
        '--ts-i-tip-x': `${place.x}px`,
        '--ts-i-tip-y': `${place.y}px`,
        '--ts-i-tip-width': `${width}px`,
        '--ts-i-tip-arrow': `${place.arrow}px`,
      })
      void element.offsetWidth
      element.removeAttribute(SNAP)
      element.removeAttribute(INSTANT)
      element.setAttribute(OPEN, '')
      label.removeAttribute(ENTERING)
      trigger.setAttribute(DESCRIBED, element.id)
      entry = 'move'
      const leaving = element.querySelector(LEAVING)
      if (!leaving) return
      const { turn } = state
      void Promise.allSettled(leaving.getAnimations().map((animation) => animation.finished)).then(() => {
        if (state.turn !== turn || state.previous === null) return
        state = { ...state, previous: null }
        notify()
      })
    },
  }
  return group
}
