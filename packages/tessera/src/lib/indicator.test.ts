import { describe, expect, it } from 'vitest'
import type { Box } from './flight'
import { measureBox, pickTarget, place, stickyHover, wallsOf, type IndicatorState } from './indicator'

type FakeNode = {
  readonly parent: FakeNode | null
  readonly selectors: readonly string[]
  closest(selector: string): FakeNode | null
}

const ITEM = '[role="menuitem"]'

function fakeNode(selectors: readonly string[], parent: FakeNode | null = null): FakeNode {
  const self: FakeNode = {
    parent,
    selectors,
    closest(selector) {
      for (let node: FakeNode | null = self; node; node = node.parent) if (node.selectors.includes(selector)) return node
      return null
    },
  }
  return self
}

describe('target choice', () => {
  const item = (isConnected = true) => ({ isConnected })

  it('marks the hovered item first, then the focused one, then the active one', () => {
    const [hover, focus, active] = [item(), item(), item()]
    expect(pickTarget({ hover, focus, active })).toBe(hover)
    expect(pickTarget({ hover: null, focus, active })).toBe(focus)
    expect(pickTarget({ focus: null, active })).toBe(active)
    expect(pickTarget({})).toBeNull()
  })

  it('skips a target that left the document', () => {
    const active = item()
    expect(pickTarget({ hover: item(false), active })).toBe(active)
  })

  it('keeps the hover pill from sliding under the active pill', () => {
    const active = item()
    expect(pickTarget({ hover: active }, active)).toBeNull()
    expect(pickTarget({ hover: null, focus: active }, active)).toBeNull()
  })

  describe('sticky hover', () => {
    const container = fakeNode(['list'])
    const first = fakeNode([ITEM], container)
    const last = fakeNode([ITEM], container)
    const separator = fakeNode(['separator'], container)
    const label = fakeNode(['group-label'], container)
    const icon = fakeNode(['icon'], first)
    const outside = fakeNode([ITEM])
    const contains = (node: FakeNode): boolean => {
      for (let current: FakeNode | null = node; current; current = current.parent) if (current === container) return true
      return false
    }

    it('follows the pointer onto an item, also through its children', () => {
      expect(stickyHover(first, contains, ITEM, null)).toBe(first)
      expect(stickyHover(icon, contains, ITEM, last)).toBe(first)
    })

    it('stays on the last row over a separator, a group label and a gap of the list', () => {
      expect(stickyHover(separator, contains, ITEM, last)).toBe(last)
      expect(stickyHover(label, contains, ITEM, last)).toBe(last)
      expect(stickyHover(container, contains, ITEM, last)).toBe(last)
    })

    it('ignores an item of another list', () => {
      expect(stickyHover(outside, contains, ITEM, last)).toBe(last)
    })
  })
})

describe('placement', () => {
  const first = { id: 'first' }
  const second = { id: 'second' }
  const box: Box = { x: 4, y: 4, width: 60, height: 28 }
  const fresh: IndicatorState<object> = { target: null, box: null, visible: false }
  const shown: IndicatorState<object> = { target: first, box, visible: true }
  const hidden: IndicatorState<object> = { ...shown, visible: false }

  it('shows the first target on its place without a flight', () => {
    expect(place(fresh, first, box)).toBe('reveal')
  })

  it('does nothing while the same target keeps its geometry within half a pixel', () => {
    expect(place(shown, first, { ...box, x: 4.4, width: 60.3 })).toBe('stay')
  })

  it('follows a new geometry of the same target without a flight', () => {
    expect(place(shown, first, { ...box, width: 90 })).toBe('follow')
    expect(place(shown, first, { ...box, y: 5 })).toBe('follow')
  })

  it('slides to a new target', () => {
    expect(place(shown, second, { ...box, x: 80 })).toBe('slide')
  })

  it('hides without a target or with an empty one', () => {
    expect(place(shown, null, null)).toBe('hide')
    expect(place(shown, second, { ...box, width: 0, height: 0 })).toBe('hide')
    expect(place(shown, second, { ...box, height: 0 })).toBe('hide')
  })

  it('returns from where it hid with a flight', () => {
    expect(place(hidden, second, { ...box, x: 80 })).toBe('slide')
    expect(place(hidden, first, box)).toBe('slide')
  })
})

describe('measurement', () => {
  const container = { left: 100, top: 50, width: 300, height: 40 }
  const layout = { width: 300, height: 40 }
  const flat = { x: 0, y: 0 }

  it('places the box relative to the container', () => {
    const target = { left: 110, top: 52, width: 60, height: 28 }
    expect(measureBox(target, container, layout, flat)).toEqual({ x: 10, y: 2, width: 60, height: 28 })
  })

  it('keeps the subpixel geometry that offsets round away', () => {
    const target = { left: 110.375, top: 52.25, width: 60.4, height: 20.297 }
    const box = measureBox(target, container, layout, flat)
    expect(box.x).toBeCloseTo(10.375)
    expect(box.y).toBeCloseTo(2.25)
    expect(box.width).toBeCloseTo(60.4)
    expect(box.height).toBeCloseTo(20.297)
  })

  it('divides by the scale of the container', () => {
    const scaled = { left: 100, top: 50, width: 150, height: 20 }
    const target = { left: 105, top: 51, width: 30, height: 14 }
    expect(measureBox(target, scaled, layout, flat)).toEqual({ x: 10, y: 2, width: 60, height: 28 })
  })

  it('treats a container that differs from its rounded layout size by under a pixel as unscaled', () => {
    const target = { left: 110, top: 52, width: 60, height: 28 }
    expect(measureBox(target, { ...container, width: 300.6 }, layout, flat)).toEqual({ x: 10, y: 2, width: 60, height: 28 })
  })

  it('measures from the padding box and the scroll position', () => {
    const target = { left: 111, top: 52, width: 60, height: 28 }
    expect(measureBox(target, container, layout, { x: 1, y: 1 - 20 })).toEqual({ x: 10, y: 21, width: 60, height: 28 })
  })

  it('puts the walls of a scrolled container in the content coordinates of the measurement', () => {
    const padding = { paddingLeft: '4px', paddingTop: '6px', paddingRight: '8px', paddingBottom: '10px' }
    const scrolled = { clientWidth: 200, clientHeight: 120, scrollLeft: 30, scrollTop: 300 }
    expect(wallsOf(scrolled, padding, 'x')).toEqual({ start: 34, end: 222 })
    expect(wallsOf(scrolled, padding, 'y')).toEqual({ start: 306, end: 410 })
    expect(wallsOf({ ...scrolled, scrollLeft: 0, scrollTop: 0 }, padding, 'y')).toEqual({ start: 6, end: 110 })

    const lastVisibleRow = measureBox(
      { left: 0, top: 132, width: 200, height: 28 },
      { left: 0, top: 50, width: 200, height: 120 },
      { width: 200, height: 120 },
      { x: -scrolled.scrollLeft, y: -scrolled.scrollTop },
    )
    expect(lastVisibleRow.y + lastVisibleRow.height).toBe(wallsOf(scrolled, padding, 'y').end)
  })
})
