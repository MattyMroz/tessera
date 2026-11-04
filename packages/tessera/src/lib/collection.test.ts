import { describe, expect, it } from 'vitest'
import { moveInCollection, NO_TYPEAHEAD, TYPEAHEAD_RESET, type CollectionItem, type CollectionKey, type Typeahead } from './collection'

const DAYS: readonly CollectionItem[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name) => ({ name, disabled: false }))
const WITH_DISABLED: readonly CollectionItem[] = DAYS.map((item) => ({ ...item, disabled: item.name === 'Tue' || item.name === 'Fri' }))
const MONTHS: readonly CollectionItem[] = ['March', 'May', 'June', 'Mars', 'July'].map((name) => ({ name, disabled: false }))
const ICONS: readonly CollectionItem[] = ['Align left', 'Align centre', 'Align right', 'Justify'].map((name) => ({ name, disabled: false }))

function move(key: string, current: number, options: Partial<CollectionKey> = {}): number | undefined {
  return moveInCollection({ items: DAYS, current, key, orientation: 'both', direction: 'ltr', typeahead: NO_TYPEAHEAD, now: 0, ...options }).index
}

function type(items: readonly CollectionItem[], current: number, keys: readonly (readonly [string, number])[]): (number | undefined)[] {
  let typeahead: Typeahead = NO_TYPEAHEAD
  let at = current
  return keys.map(([key, now]) => {
    const result = moveInCollection({ items, current: at, key, orientation: 'horizontal', direction: 'ltr', typeahead, now })
    typeahead = result.typeahead
    at = result.index ?? at
    return result.index
  })
}

describe('moveInCollection', () => {
  it.each([
    ['ArrowRight', 1, 2],
    ['ArrowDown', 1, 2],
    ['ArrowLeft', 1, 0],
    ['ArrowUp', 1, 0],
    ['ArrowRight', 4, 0],
    ['ArrowLeft', 0, 4],
    ['Home', 3, 0],
    ['End', 1, 4],
  ])('moves %s from item %d to item %d in both orientations and wraps at the ends', (key, from, to) => {
    expect(move(key, from)).toBe(to)
  })

  it('takes only the arrows of its orientation', () => {
    expect(move('ArrowRight', 1, { orientation: 'horizontal' })).toBe(2)
    expect(move('ArrowDown', 1, { orientation: 'horizontal' })).toBeUndefined()
    expect(move('ArrowDown', 1, { orientation: 'vertical' })).toBe(2)
    expect(move('ArrowRight', 1, { orientation: 'vertical' })).toBeUndefined()
  })

  it('swaps the left and right arrows from right to left and keeps up and down', () => {
    expect(move('ArrowLeft', 1, { direction: 'rtl' })).toBe(2)
    expect(move('ArrowRight', 1, { direction: 'rtl' })).toBe(0)
    expect(move('ArrowDown', 1, { direction: 'rtl' })).toBe(2)
    expect(move('ArrowUp', 1, { direction: 'rtl' })).toBe(0)
  })

  it('skips disabled items with the arrows, Home and End', () => {
    expect(move('ArrowRight', 0, { items: WITH_DISABLED })).toBe(2)
    expect(move('ArrowLeft', 0, { items: WITH_DISABLED })).toBe(3)
    expect(move('Home', 3, { items: WITH_DISABLED.map((item, index) => ({ ...item, disabled: index === 0 || item.disabled })) })).toBe(2)
    expect(move('End', 0, { items: WITH_DISABLED })).toBe(3)
  })

  it('enters from the ends without a current item and does nothing without items or with every item disabled', () => {
    expect(move('ArrowRight', -1)).toBe(0)
    expect(move('ArrowLeft', -1)).toBe(4)
    expect(move('Home', 0, { items: [] })).toBeUndefined()
    expect(move('ArrowRight', 0, { items: DAYS.map((item) => ({ ...item, disabled: true })) })).toBeUndefined()
  })

  it('ignores keys that neither move nor type', () => {
    expect(move('Tab', 1)).toBeUndefined()
    expect(move('Enter', 1)).toBeUndefined()
    expect(move(' ', 1)).toBeUndefined()
  })

  it('moves to the next item whose name starts with a typed letter, ignoring its case', () => {
    expect(move('w', 0)).toBe(2)
    expect(move('F', 0)).toBe(4)
    expect(move('x', 0)).toBeUndefined()
  })

  it('cycles through the items that start with the same letter typed again', () => {
    expect(type(MONTHS, 0, [['m', 0], ['m', 100], ['m', 200]])).toEqual([1, 3, 0])
  })

  it('matches the whole typed text and keeps the current item when it still matches', () => {
    expect(type(MONTHS, 2, [['m', 0], ['a', 100], ['r', 200], ['s', 300]])).toEqual([3, undefined, undefined, undefined])
    expect(type(MONTHS, 4, [['j', 0], ['u', 100], ['n', 200]])).toEqual([2, undefined, undefined])
  })

  it(`starts a new text after ${TYPEAHEAD_RESET} ms without a key`, () => {
    expect(type(DAYS, 0, [['t', 0], ['h', TYPEAHEAD_RESET]])).toEqual([1, 3])
    expect(type(DAYS, 0, [['t', 0], ['h', TYPEAHEAD_RESET + 1]])).toEqual([1, undefined])
  })

  it('skips disabled items while typing', () => {
    expect(move('t', 0, { items: WITH_DISABLED })).toBe(3)
    expect(move('f', 0, { items: WITH_DISABLED })).toBeUndefined()
  })

  it('types a space only inside a typed text', () => {
    expect(type(ICONS, 3, [['a', 0], ['l', 100], ['i', 200], ['g', 300], ['n', 400], [' ', 500], ['r', 600]])).toEqual([
      0, undefined, undefined, undefined, undefined, undefined, 2,
    ])
  })

  it('finds an icon-only item by its accessible name', () => {
    expect(move('j', 0, { items: ICONS })).toBe(3)
  })

  it('clears the typed text after an arrow, Home or End', () => {
    const typed = moveInCollection({ items: DAYS, current: 0, key: 't', orientation: 'both', direction: 'ltr', typeahead: NO_TYPEAHEAD, now: 0 })
    expect(typed.typeahead.text).toBe('t')
    for (const key of ['ArrowRight', 'Home', 'End']) {
      expect(moveInCollection({ items: DAYS, current: 1, key, orientation: 'both', direction: 'ltr', typeahead: typed.typeahead, now: 1 }).typeahead).toEqual(NO_TYPEAHEAD)
    }
  })
})
