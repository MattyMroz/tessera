import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PRESSING, releaseDelay, trackPresses, watchPresses } from './press'

class Listening extends EventTarget {
  readonly listeners = new Map<string, Set<unknown>>()

  listening(): string[] {
    return [...this.listeners].filter(([, set]) => set.size > 0).map(([type]) => type)
  }

  override addEventListener(...args: Parameters<EventTarget['addEventListener']>): void {
    const [type, listener] = args
    this.listeners.set(type, (this.listeners.get(type) ?? new Set()).add(listener))
    super.addEventListener(...args)
  }

  override removeEventListener(...args: Parameters<EventTarget['removeEventListener']>): void {
    const [type, listener] = args
    this.listeners.get(type)?.delete(listener)
    super.removeEventListener(...args)
  }
}

class FakeWindow extends Listening {}

class FakeDocument extends Listening {
  constructor(readonly defaultView: FakeWindow) {
    super()
  }
}

class FakeElement {
  readonly attributes = new Map<string, string>()

  constructor(
    readonly ownerDocument: FakeDocument,
    readonly kind: { pressable?: boolean; blocked?: boolean; link?: boolean } = { pressable: true },
  ) {}

  closest(): FakeElement | null {
    return this.kind.pressable ? this : null
  }

  matches(selector: string): boolean {
    return selector === 'a[href]' ? Boolean(this.kind.link) : Boolean(this.kind.blocked)
  }

  getBoundingClientRect(): { left: number; top: number; right: number; bottom: number } {
    return { left: 0, top: 0, right: 100, bottom: 30 }
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value)
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name)
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name)
  }

  get pressed(): boolean {
    return this.attributes.has(PRESSING)
  }
}

const POINTER_EVENTS = ['pointermove', 'pointerup', 'pointercancel']
const style = { getPropertyValue: (name: string) => (name === '--ts-motion-press-hold' ? '.1s' : '') }
vi.stubGlobal('Element', FakeElement)
vi.stubGlobal('getComputedStyle', () => style)

type Fields = { target?: FakeElement; at?: number; button?: number; pointerId?: number; x?: number; y?: number; key?: string; repeat?: boolean }

function event(type: string, { target, at = 0, button = 0, pointerId = 1, x = 50, y = 15, key = '', repeat = false }: Fields = {}): Event {
  const made = new Event(type)
  const fields = { target, timeStamp: at, button, pointerId, clientX: x, clientY: y, key, repeat }
  for (const [name, value] of Object.entries(fields)) Object.defineProperty(made, name, { value })
  return made
}

function setup(): { view: FakeWindow; page: FakeDocument; stop: () => void } {
  const view = new FakeWindow()
  const page = new FakeDocument(view)
  return { view, page, stop: trackPresses(page as unknown as Document) }
}

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('releaseDelay', () => {
  it.each([
    [1000, 1010, 100, 90],
    [1000, 1100, 100, 0],
    [1000, 1500, 100, 0],
    [1000, 1000, 0, 0],
  ])('keeps a press from %d released at %d for %d ms more by %d ms', (pressedAt, releasedAt, hold, delay) => {
    expect(releaseDelay(pressedAt, releasedAt, hold)).toBe(delay)
  })
})

describe('trackPresses', () => {
  let stop: () => void = () => {}

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    stop()
    vi.useRealTimers()
  })

  it('holds a quick click pressed for the press hold of the engine', () => {
    const tracked = setup()
    stop = tracked.stop
    const button = new FakeElement(tracked.page)
    tracked.page.dispatchEvent(event('pointerdown', { target: button, at: 1000 }))
    expect(button.attributes.get(PRESSING)).toBe('')
    tracked.view.dispatchEvent(event('pointerup', { at: 1010 }))
    expect(button.pressed).toBe(true)
    vi.advanceTimersByTime(89)
    expect(button.pressed).toBe(true)
    vi.advanceTimersByTime(1)
    expect(button.pressed).toBe(false)
  })

  it('releases a long press at once', () => {
    const tracked = setup()
    stop = tracked.stop
    const button = new FakeElement(tracked.page)
    tracked.page.dispatchEvent(event('pointerdown', { target: button, at: 1000 }))
    tracked.view.dispatchEvent(event('pointerup', { at: 1150 }))
    expect(button.pressed).toBe(false)
  })

  it('ignores any button but the primary one, a target outside a pressable control and a blocked control', () => {
    const tracked = setup()
    stop = tracked.stop
    const button = new FakeElement(tracked.page)
    const text = new FakeElement(tracked.page, { pressable: false })
    const busy = new FakeElement(tracked.page, { pressable: true, blocked: true })
    tracked.page.dispatchEvent(event('pointerdown', { target: button, button: 2 }))
    tracked.page.dispatchEvent(event('pointerdown', { target: text }))
    tracked.page.dispatchEvent(event('pointerdown', { target: busy }))
    expect([button.pressed, text.pressed, busy.pressed]).toEqual([false, false, false])
  })

  it('lifts the press when the pointer leaves the box it had at the press and presses again when it comes back', () => {
    const tracked = setup()
    stop = tracked.stop
    const button = new FakeElement(tracked.page)
    tracked.page.dispatchEvent(event('pointerdown', { target: button, at: 1000 }))
    tracked.view.dispatchEvent(event('pointermove', { at: 1100, x: 100, y: 30 }))
    expect(button.pressed).toBe(true)
    tracked.view.dispatchEvent(event('pointermove', { at: 1200, x: 101, y: 15 }))
    expect(button.pressed).toBe(false)
    tracked.view.dispatchEvent(event('pointermove', { at: 1300, x: 99, y: 15 }))
    expect(button.pressed).toBe(true)
    tracked.view.dispatchEvent(event('pointermove', { at: 1400, x: 50, y: -1 }))
    tracked.view.dispatchEvent(event('pointerup', { at: 1500, x: 50, y: -1 }))
    vi.advanceTimersByTime(1000)
    expect(button.pressed).toBe(false)
  })

  it('follows another pointer only by its own id', () => {
    const tracked = setup()
    stop = tracked.stop
    const first = new FakeElement(tracked.page)
    const second = new FakeElement(tracked.page)
    tracked.page.dispatchEvent(event('pointerdown', { target: first, at: 1000, pointerId: 1 }))
    tracked.page.dispatchEvent(event('pointerdown', { target: second, at: 1000, pointerId: 2 }))
    tracked.view.dispatchEvent(event('pointermove', { at: 1200, pointerId: 2, x: 500 }))
    tracked.view.dispatchEvent(event('pointerup', { at: 1300, pointerId: 1 }))
    expect([first.pressed, second.pressed]).toEqual([false, false])
    tracked.view.dispatchEvent(event('pointermove', { at: 1400, pointerId: 2 }))
    expect(second.pressed).toBe(true)
  })

  it('holds Space down until the key goes up and flashes Enter for the press hold', () => {
    const tracked = setup()
    stop = tracked.stop
    const button = new FakeElement(tracked.page)
    tracked.page.dispatchEvent(event('keydown', { target: button, at: 1000, key: ' ' }))
    tracked.page.dispatchEvent(event('keydown', { target: button, at: 1400, key: ' ', repeat: true }))
    vi.advanceTimersByTime(1000)
    expect(button.pressed).toBe(true)
    tracked.page.dispatchEvent(event('keyup', { target: button, at: 2000, key: ' ' }))
    expect(button.pressed).toBe(false)
    tracked.page.dispatchEvent(event('keydown', { target: button, at: 3000, key: 'Enter' }))
    expect(button.pressed).toBe(true)
    vi.advanceTimersByTime(99)
    expect(button.pressed).toBe(true)
    vi.advanceTimersByTime(1)
    expect(button.pressed).toBe(false)
  })

  it('presses a link with Enter but not with Space and ignores other keys', () => {
    const tracked = setup()
    stop = tracked.stop
    const link = new FakeElement(tracked.page, { pressable: true, link: true })
    tracked.page.dispatchEvent(event('keydown', { target: link, key: ' ' }))
    tracked.page.dispatchEvent(event('keydown', { target: link, key: 'a' }))
    expect(link.pressed).toBe(false)
    tracked.page.dispatchEvent(event('keydown', { target: link, key: 'Enter' }))
    expect(link.pressed).toBe(true)
  })

  it('lifts a Space press when its control loses focus and every press when the window loses focus', () => {
    const tracked = setup()
    stop = tracked.stop
    const button = new FakeElement(tracked.page)
    const other = new FakeElement(tracked.page)
    tracked.page.dispatchEvent(event('keydown', { target: button, key: ' ' }))
    tracked.page.dispatchEvent(event('focusout', { target: button }))
    expect(button.pressed).toBe(false)
    tracked.page.dispatchEvent(event('keydown', { target: button, key: ' ' }))
    tracked.page.dispatchEvent(event('pointerdown', { target: other, pointerId: 3 }))
    tracked.view.dispatchEvent(event('blur'))
    expect([button.pressed, other.pressed]).toEqual([false, false])
    expect(tracked.view.listening().filter((type) => POINTER_EVENTS.includes(type))).toEqual([])
  })

  it('keeps a new press that comes during the hold of the previous one', () => {
    const tracked = setup()
    stop = tracked.stop
    const button = new FakeElement(tracked.page)
    tracked.page.dispatchEvent(event('pointerdown', { target: button, at: 1000 }))
    tracked.view.dispatchEvent(event('pointerup', { at: 1010 }))
    tracked.page.dispatchEvent(event('pointerdown', { target: button, at: 1030 }))
    vi.advanceTimersByTime(200)
    expect(button.pressed).toBe(true)
  })

  it('listens for the pointer on the window only from a press until its release', () => {
    const tracked = setup()
    stop = tracked.stop
    const pointerListeners = (): string[] => tracked.view.listening().filter((type) => POINTER_EVENTS.includes(type))
    const button = new FakeElement(tracked.page)
    expect(pointerListeners()).toEqual([])
    tracked.page.dispatchEvent(event('pointerdown', { target: button, at: 1000 }))
    expect(pointerListeners()).toEqual(POINTER_EVENTS)
    tracked.view.dispatchEvent(event('pointercancel', { at: 1200 }))
    expect(pointerListeners()).toEqual([])
  })

  it('clears every mark and stops listening when it stops', () => {
    const tracked = setup()
    const button = new FakeElement(tracked.page)
    tracked.page.dispatchEvent(event('pointerdown', { target: button, at: 1000 }))
    tracked.stop()
    expect(button.pressed).toBe(false)
    expect([...tracked.page.listening(), ...tracked.view.listening()]).toEqual([])
    tracked.page.dispatchEvent(event('pointerdown', { target: button, at: 2000 }))
    expect(button.pressed).toBe(false)
  })
})

describe('watchPresses', () => {
  it('installs one tracker for each document while any watched control is mounted', () => {
    const page = new FakeDocument(new FakeWindow())
    const watch = (): (() => void) | undefined => watchPresses(new FakeElement(page) as unknown as Element)
    expect(watchPresses(null)).toBeUndefined()
    const first = watch()
    const second = watch()
    expect(page.listeners.get('pointerdown')?.size).toBe(1)
    first?.()
    expect(page.listeners.get('pointerdown')?.size).toBe(1)
    second?.()
    expect(page.listening()).toEqual([])
  })
})
