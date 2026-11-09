import { afterAll, describe, expect, it, vi } from 'vitest'
import { INPUT_CONFIG, navigates, trackInputModality, type KeyStroke } from './input-modality'

class FakeElement extends EventTarget {
  readonly tag: string
  readonly attributes = new Map<string, string>()

  constructor(tag: string) {
    super()
    this.tag = tag
  }

  matches(selector: string): boolean {
    return selector.split(',').some((part) => part.trim() === this.tag)
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value)
  }
}

class FakeDocument extends EventTarget {
  activeElement: FakeElement | null = null
  readonly attributes = new Map<string, string>()
  readonly documentElement = {
    getAttribute: (name: string) => this.attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => {
      this.attributes.set(name, value)
    },
  }
}

vi.stubGlobal('Element', FakeElement)

afterAll(() => {
  vi.unstubAllGlobals()
})

function stroke(key: string, init: Partial<KeyStroke> = {}): KeyStroke {
  return { key, altKey: false, ctrlKey: false, metaKey: false, isComposing: false, target: null, ...init }
}

function key(name: string, init: Partial<KeyStroke> = {}): Event {
  const event = new Event('keydown')
  for (const [field, value] of Object.entries(stroke(name, init))) Object.defineProperty(event, field, { value })
  return event
}

describe('navigates', () => {
  it.each(['Tab', 'Enter', ' ', 'Escape', 'ArrowDown', 'Home', 'PageUp'])('counts %j as keyboard navigation', (name) => {
    expect(navigates(stroke(name))).toBe(true)
  })

  it.each(['Shift', 'F5', 'Backspace'])('ignores %j', (name) => {
    expect(navigates(stroke(name))).toBe(false)
  })

  it('counts a letter typed outside a text field as keyboard navigation, because typeahead moves the focus with it', () => {
    expect(navigates(stroke('a', { target: new FakeElement('button') }))).toBe(true)
    expect(navigates(stroke('M'))).toBe(true)
    expect(navigates(stroke('a', { target: new FakeElement('input') }))).toBe(false)
    expect(navigates(stroke('a', { ctrlKey: true }))).toBe(false)
  })

  it('ignores shortcuts and composition', () => {
    expect(navigates(stroke('Tab', { ctrlKey: true }))).toBe(false)
    expect(navigates(stroke('ArrowLeft', { altKey: true }))).toBe(false)
    expect(navigates(stroke('Enter', { metaKey: true }))).toBe(false)
    expect(navigates(stroke('Enter', { isComposing: true }))).toBe(false)
  })

  it('ignores a space typed into a text field but not one pressed on a button', () => {
    expect(navigates(stroke(' ', { target: new FakeElement('input') }))).toBe(false)
    expect(navigates(stroke(' ', { target: new FakeElement('textarea') }))).toBe(false)
    expect(navigates(stroke(' ', { target: new FakeElement('button') }))).toBe(true)
  })
})

describe('trackInputModality', () => {
  it('marks the document with the last input that moved the focus', () => {
    const root = new FakeDocument()
    trackInputModality(root, INPUT_CONFIG, navigates)
    expect(root.attributes.has(INPUT_CONFIG.attribute)).toBe(false)

    root.dispatchEvent(new Event('pointerdown'))
    expect(root.attributes.get(INPUT_CONFIG.attribute)).toBe('pointer')
    root.dispatchEvent(key('Tab'))
    expect(root.attributes.get(INPUT_CONFIG.attribute)).toBe('keyboard')
    root.dispatchEvent(new Event('pointerdown'))
    root.dispatchEvent(key('a', { target: new FakeElement('input') }))
    root.dispatchEvent(key(' ', { target: new FakeElement('input') }))
    expect(root.attributes.get(INPUT_CONFIG.attribute)).toBe('pointer')
    root.dispatchEvent(key('a', { target: new FakeElement('button') }))
    expect(root.attributes.get(INPUT_CONFIG.attribute)).toBe('keyboard')
  })

  it('marks only the focused control with the input that moved the focus, so the focus ring never restyles the page', () => {
    const root = new FakeDocument()
    trackInputModality(root, INPUT_CONFIG, navigates)
    const control = new FakeElement(INPUT_CONFIG.focusTarget)
    const field = new FakeElement('input')
    const focusIn = new Event('focusin')
    Object.defineProperty(focusIn, 'target', { value: control })
    root.dispatchEvent(focusIn)
    expect(control.attributes.has(INPUT_CONFIG.attribute)).toBe(false)

    root.dispatchEvent(new Event('pointerdown'))
    const again = new Event('focusin')
    Object.defineProperty(again, 'target', { value: control })
    root.dispatchEvent(again)
    root.activeElement = control
    expect(control.attributes.get(INPUT_CONFIG.attribute)).toBe('pointer')

    root.dispatchEvent(key('Enter'))
    expect(control.attributes.get(INPUT_CONFIG.attribute)).toBe('keyboard')

    const fieldIn = new Event('focusin')
    Object.defineProperty(fieldIn, 'target', { value: field })
    root.dispatchEvent(fieldIn)
    expect(field.attributes.has(INPUT_CONFIG.attribute)).toBe(false)
  })

  it('runs without the module scope, as the boot script runs it', () => {
    const root = new FakeDocument()
    const detached = new Function(`return [${String(trackInputModality)}, ${String(navigates)}]`)()
    detached[0](root, INPUT_CONFIG, detached[1])
    root.dispatchEvent(key('ArrowDown'))
    expect(root.attributes.get(INPUT_CONFIG.attribute)).toBe('keyboard')
  })
})
