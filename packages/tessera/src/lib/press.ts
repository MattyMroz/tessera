import { readMotion } from './motion'

export const PRESSING = 'data-pressing'

const PRESSABLE = "[data-recipe='control']:is(button, a[href], [role='button'], [tabindex]):not([role='radio']:not([data-slot='box']), [role='tab'], [role='menuitem'])"
const UNPRESSABLE = ":disabled, [data-disabled], [aria-disabled='true'], [aria-busy='true'], [data-variant='field']"
const CHOICE = "[data-slot='choice']"
const LINK = 'a[href]'
const PRIMARY_BUTTON = 0
const SPACE = ' '
const ENTER = 'Enter'
const CAPTURE = { capture: true } as const

type Edges = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>

type PointerPress = { readonly element: Element; readonly edges: Edges }

type Watcher = { count: number; readonly stop: () => void }

const watchers = new Map<Document, Watcher>()

export function releaseDelay(pressedAt: number, releasedAt: number, hold: number): number {
  return Math.max(0, hold - (releasedAt - pressedAt))
}

function within(edges: Edges, x: number, y: number): boolean {
  return x >= edges.left && x <= edges.right && y >= edges.top && y <= edges.bottom
}

function pressableAt(event: Event): Element | undefined {
  const target = event.target instanceof Element ? event.target : null
  const found = target?.closest(PRESSABLE) ?? target?.closest(CHOICE)?.querySelector(PRESSABLE) ?? null
  return found && !found.matches(UNPRESSABLE) ? found : undefined
}

function pressAreaOf(element: Element): Element {
  return element.closest(CHOICE) ?? element
}

export function trackPresses(document: Document): () => void {
  const view = document.defaultView
  const pointers = new Map<number, PointerPress>()
  const lifts = new Map<Element, ReturnType<typeof setTimeout>>()
  const pressedAt = new WeakMap<Element, number>()
  let spaced: Element | undefined

  const lift = (element: Element): void => {
    clearTimeout(lifts.get(element))
    lifts.delete(element)
    element.removeAttribute(PRESSING)
  }
  const press = (element: Element, at: number): void => {
    clearTimeout(lifts.get(element))
    lifts.delete(element)
    pressedAt.set(element, at)
    element.setAttribute(PRESSING, '')
  }
  const release = (element: Element, at: number): void => {
    const delay = releaseDelay(pressedAt.get(element) ?? at, at, readMotion(element).pressHold)
    if (delay === 0) lift(element)
    else lifts.set(element, setTimeout(() => lift(element), delay))
  }

  const move = (event: PointerEvent): void => {
    const held = pointers.get(event.pointerId)
    if (!held) return
    const inside = within(held.edges, event.clientX, event.clientY)
    const pressed = held.element.hasAttribute(PRESSING)
    if (inside && !pressed) press(held.element, event.timeStamp)
    if (!inside && pressed) lift(held.element)
  }
  const unwatchPointers = (): void => {
    view?.removeEventListener('pointermove', move, CAPTURE)
    view?.removeEventListener('pointerup', end, CAPTURE)
    view?.removeEventListener('pointercancel', end, CAPTURE)
  }
  const end = (event: PointerEvent): void => {
    const held = pointers.get(event.pointerId)
    if (!held) return
    pointers.delete(event.pointerId)
    if (pointers.size === 0) unwatchPointers()
    if (held.element.hasAttribute(PRESSING)) release(held.element, event.timeStamp)
  }
  const watchPointers = (): void => {
    view?.addEventListener('pointermove', move, CAPTURE)
    view?.addEventListener('pointerup', end, CAPTURE)
    view?.addEventListener('pointercancel', end, CAPTURE)
  }
  const down = (event: PointerEvent): void => {
    if (event.button !== PRIMARY_BUTTON) return
    const element = pressableAt(event)
    if (!element) return
    if (pointers.size === 0) watchPointers()
    pointers.set(event.pointerId, { element, edges: pressAreaOf(element).getBoundingClientRect() })
    press(element, event.timeStamp)
  }
  const keyDown = (event: KeyboardEvent): void => {
    if (event.repeat || (event.key !== SPACE && event.key !== ENTER)) return
    const element = pressableAt(event)
    if (!element || (event.key === SPACE && element.matches(LINK))) return
    press(element, event.timeStamp)
    if (event.key === ENTER) {
      release(element, event.timeStamp)
      return
    }
    if (spaced && spaced !== element) lift(spaced)
    spaced = element
  }
  const keyUp = (event: KeyboardEvent): void => {
    if (event.key !== SPACE || !spaced) return
    release(spaced, event.timeStamp)
    spaced = undefined
  }
  const focusOut = (event: FocusEvent): void => {
    if (!spaced || event.target !== spaced) return
    lift(spaced)
    spaced = undefined
  }
  const liftAll = (): void => {
    for (const { element } of pointers.values()) lift(element)
    for (const element of [...lifts.keys()]) lift(element)
    if (spaced) lift(spaced)
    pointers.clear()
    spaced = undefined
    unwatchPointers()
  }

  document.addEventListener('pointerdown', down, CAPTURE)
  document.addEventListener('keydown', keyDown, CAPTURE)
  document.addEventListener('keyup', keyUp, CAPTURE)
  document.addEventListener('focusout', focusOut, CAPTURE)
  view?.addEventListener('blur', liftAll)
  return () => {
    liftAll()
    document.removeEventListener('pointerdown', down, CAPTURE)
    document.removeEventListener('keydown', keyDown, CAPTURE)
    document.removeEventListener('keyup', keyUp, CAPTURE)
    document.removeEventListener('focusout', focusOut, CAPTURE)
    view?.removeEventListener('blur', liftAll)
  }
}

export function watchPresses(node: Element | null): (() => void) | undefined {
  if (!node) return undefined
  const document = node.ownerDocument
  const watcher = watchers.get(document) ?? { count: 0, stop: trackPresses(document) }
  watcher.count += 1
  watchers.set(document, watcher)
  return () => {
    watcher.count -= 1
    if (watcher.count > 0) return
    watcher.stop()
    watchers.delete(document)
  }
}
