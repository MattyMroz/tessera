import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PRESSING, releaseDelay, trackPress } from './press'

class FakeElement extends EventTarget {
  readonly attributes = new Map<string, string>()

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value)
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name)
  }
}

class FakePointerEvent extends Event {}

class FakeWindow extends EventTarget {
  readonly listeners = new Map<string, Set<unknown>>()

  matchMedia(): EventTarget {
    return new EventTarget()
  }

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

const RELEASE_EVENTS = ['pointerup', 'pointercancel', 'blur']
const host = new FakeWindow()
const releaseListeners = () => host.listening().filter((type) => RELEASE_EVENTS.includes(type))
const style = { getPropertyValue: (name: string) => (name === '--ts-motion-duration-fast' ? '.1s' : '') }
vi.stubGlobal('window', host)
vi.stubGlobal('getComputedStyle', () => style)
vi.stubGlobal('PointerEvent', FakePointerEvent)

function pointer(type: string, at: number, button = 0): Event {
  const event = type === 'pointerdown' ? new FakePointerEvent(type) : new Event(type)
  Object.defineProperty(event, 'timeStamp', { value: at })
  Object.defineProperty(event, 'button', { value: button })
  return event
}

function track(button: FakeElement): () => void {
  return trackPress(button as unknown as Element)
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

describe('trackPress', () => {
  let stop: () => void = () => {}

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    stop()
    vi.useRealTimers()
  })

  it('holds a quick click pressed for the fast duration of the engine', () => {
    const button = new FakeElement()
    stop = track(button)
    button.dispatchEvent(pointer('pointerdown', 1000))
    expect(button.attributes.get(PRESSING)).toBe('')
    host.dispatchEvent(pointer('pointerup', 1010))
    expect(button.attributes.has(PRESSING)).toBe(true)
    vi.advanceTimersByTime(89)
    expect(button.attributes.has(PRESSING)).toBe(true)
    vi.advanceTimersByTime(1)
    expect(button.attributes.has(PRESSING)).toBe(false)
  })

  it('releases a long press at once', () => {
    const button = new FakeElement()
    stop = track(button)
    button.dispatchEvent(pointer('pointerdown', 1000))
    host.dispatchEvent(pointer('pointerup', 1150))
    expect(button.attributes.has(PRESSING)).toBe(false)
  })

  it('releases when the window loses focus', () => {
    const button = new FakeElement()
    stop = track(button)
    button.dispatchEvent(pointer('pointerdown', 1000))
    host.dispatchEvent(pointer('blur', 1200))
    expect(button.attributes.has(PRESSING)).toBe(false)
  })

  it('ignores any button but the primary one', () => {
    const button = new FakeElement()
    stop = track(button)
    button.dispatchEvent(pointer('pointerdown', 1000, 2))
    expect(button.attributes.has(PRESSING)).toBe(false)
  })

  it('keeps a new press that comes during the hold of the previous one', () => {
    const button = new FakeElement()
    stop = track(button)
    button.dispatchEvent(pointer('pointerdown', 1000))
    host.dispatchEvent(pointer('pointerup', 1010))
    button.dispatchEvent(pointer('pointerdown', 1030))
    vi.advanceTimersByTime(200)
    expect(button.attributes.has(PRESSING)).toBe(true)
  })

  it('listens on the window only from a press until its release', () => {
    const button = new FakeElement()
    stop = track(button)
    expect(releaseListeners()).toEqual([])
    button.dispatchEvent(pointer('pointerdown', 1000))
    expect(releaseListeners()).toEqual(RELEASE_EVENTS)
    host.dispatchEvent(pointer('pointercancel', 1200))
    expect(releaseListeners()).toEqual([])
    button.dispatchEvent(pointer('pointerdown', 1300))
    stop()
    expect(releaseListeners()).toEqual([])
  })

  it('clears the mark and stops listening when it is released', () => {
    const button = new FakeElement()
    const release = track(button)
    button.dispatchEvent(pointer('pointerdown', 1000))
    release()
    expect(button.attributes.has(PRESSING)).toBe(false)
    button.dispatchEvent(pointer('pointerdown', 2000))
    expect(button.attributes.has(PRESSING)).toBe(false)
  })
})
