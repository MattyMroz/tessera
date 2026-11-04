import { describe, expect, it } from 'vitest'
import { visibleCount } from './bar-overflow'

const WIDTHS = [40, 50, 60]
const GAP = 4
const MORE = 30
const ALL = 40 + 4 + 50 + 4 + 60

describe('visibleCount', () => {
  it('shows every trigger without the more button when all of them fit exactly', () => {
    expect(visibleCount(WIDTHS, GAP, MORE, ALL)).toBe(WIDTHS.length)
  })

  it('keeps room for the more button after every trigger but the last', () => {
    expect(visibleCount(WIDTHS, GAP, MORE, ALL - 1)).toBe(2)
    expect(visibleCount(WIDTHS, GAP, MORE, 40 + 4 + 50 + 4 + MORE)).toBe(2)
    expect(visibleCount(WIDTHS, GAP, MORE, 40 + 4 + 50 + 4 + MORE - 1)).toBe(1)
  })

  it('hides every trigger when even the first one leaves no room for the more button', () => {
    expect(visibleCount(WIDTHS, GAP, MORE, 0)).toBe(0)
    expect(visibleCount(WIDTHS, GAP, MORE, 40 + 4 + MORE - 1)).toBe(0)
  })

  it('shows a single trigger that fits and hides it when it does not', () => {
    expect(visibleCount([40], GAP, MORE, 40)).toBe(1)
    expect(visibleCount([40], GAP, MORE, 39)).toBe(0)
  })

  it('shows nothing for an empty bar', () => {
    expect(visibleCount([], GAP, MORE, 100)).toBe(0)
  })
})
