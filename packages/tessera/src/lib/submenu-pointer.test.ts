import { describe, expect, it, vi } from 'vitest'
import { createSubmenuStore, headingInto } from './submenu-pointer'

const SUBMENU = { left: 200, top: 100, width: 120, height: 160 }

describe('heading into an open submenu', () => {
  it('heads into a submenu on the right while the pointer moves towards it', () => {
    expect(headingInto({ x: 100, y: 150 }, { x: 110, y: 160 }, SUBMENU, 'right')).toBe(true)
    expect(headingInto({ x: 100, y: 150 }, { x: 205, y: 300 }, SUBMENU, 'right')).toBe(true)
  })

  it('does not head into it while the pointer moves away or along the menu past it', () => {
    expect(headingInto({ x: 110, y: 150 }, { x: 100, y: 160 }, SUBMENU, 'right')).toBe(false)
    expect(headingInto({ x: 100, y: 150 }, { x: 104, y: 290 }, SUBMENU, 'right')).toBe(false)
  })

  it('reads a submenu on the left the other way round, also on the logical start side', () => {
    const left = { left: 0, top: 100, width: 120, height: 160 }
    for (const side of ['left', 'inline-start']) {
      expect(headingInto({ x: 200, y: 150 }, { x: 190, y: 160 }, left, side)).toBe(true)
      expect(headingInto({ x: 190, y: 150 }, { x: 200, y: 160 }, left, side)).toBe(false)
    }
  })

  it('reads the logical end side as the right', () => {
    expect(headingInto({ x: 100, y: 150 }, { x: 110, y: 160 }, SUBMENU, 'inline-end')).toBe(true)
  })
})


describe('submenu store', () => {
  it('opens one submenu at a time and tells only its listeners', () => {
    const store = createSubmenuStore<{ id: string }>()
    const listener = vi.fn()
    const stop = store.subscribe(listener)
    const [text, bubble] = [{ id: 'text' }, { id: 'bubble' }]
    store.open(text)
    store.open(bubble)
    expect(store.trigger()).toBe(bubble)
    store.close(text)
    expect(store.trigger()).toBe(bubble)
    store.close(bubble)
    expect(store.trigger()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(3)
    store.open(null)
    expect(listener).toHaveBeenCalledTimes(3)
    stop()
  })
})
