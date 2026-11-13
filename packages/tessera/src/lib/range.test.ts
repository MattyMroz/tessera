import { describe, expect, it } from 'vitest'
import { bandStretch, fractionOf, isStepped, keyStop, MAX_MARKS, onlyDigitsChange, stopsOf, trailingStop, valueOfStop, widestValues, type Range } from './range'

const PERCENT: Range = { min: 0, max: 100, step: 1 }
const EFFORT: Range = { min: 0, max: 3, step: 1 }
const WEIGHT: Range = { min: 100, max: 900, step: 100 }
const TENTHS: Range = { min: 0, max: 1, step: 0.1 }

describe('text change', () => {
  it('treats a new number with the same symbols and units as a change of digits', () => {
    expect(onlyDigitsChange('$100', '$200')).toBe(true)
    expect(onlyDigitsChange('9%', '10%')).toBe(true)
    expect(onlyDigitsChange('1,000 px', '980 px')).toBe(true)
  })

  it('treats a new word as a change of text', () => {
    expect(onlyDigitsChange('Low', 'Medium')).toBe(false)
    expect(onlyDigitsChange('Off', '50%')).toBe(false)
  })
})

describe('stops', () => {
  it('counts the steps between the ends of the range', () => {
    expect(stopsOf(PERCENT)).toBe(100)
    expect(stopsOf(EFFORT)).toBe(3)
    expect(stopsOf(WEIGHT)).toBe(8)
    expect(stopsOf(TENTHS)).toBe(10)
  })

  it('keeps one step for a range shorter than its step', () => {
    expect(stopsOf({ min: 0, max: 1, step: 5 })).toBe(1)
  })

  it('calls a range stepped up to the most marks a track shows', () => {
    expect(isStepped({ min: 0, max: MAX_MARKS, step: 1 })).toBe(true)
    expect(isStepped({ min: 0, max: MAX_MARKS + 1, step: 1 })).toBe(false)
  })
})

describe('values', () => {
  it('gives the value of a stop without the noise of binary fractions', () => {
    expect(valueOfStop(3, TENTHS)).toBe(0.3)
    expect(valueOfStop(7, TENTHS)).toBe(0.7)
    expect(valueOfStop(4, WEIGHT)).toBe(500)
  })

  it('keeps a value inside the range', () => {
    expect(valueOfStop(12, TENTHS)).toBe(1)
    expect(valueOfStop(-2, WEIGHT)).toBe(100)
  })

  it('places a value between the ends as a fraction', () => {
    expect(fractionOf(40, PERCENT)).toBe(0.4)
    expect(fractionOf(500, WEIGHT)).toBe(0.5)
    expect(fractionOf(-5, PERCENT)).toBe(0)
    expect(fractionOf(140, PERCENT)).toBe(1)
  })
})

describe('the stop that trails the pointer', () => {
  it('takes the nearest stop for a pointer that has no stop yet', () => {
    expect(trailingStop(null, 1.4)).toBe(1)
    expect(trailingStop(null, 1.6)).toBe(2)
  })

  it('stays on its stop until the pointer reaches the next one', () => {
    expect(trailingStop(1, 1.5)).toBe(1)
    expect(trailingStop(1, 1.9)).toBe(1)
    expect(trailingStop(1, 2)).toBe(2)
  })

  it('stays on its stop until the pointer reaches the one before', () => {
    expect(trailingStop(2, 1.5)).toBe(2)
    expect(trailingStop(2, 1.1)).toBe(2)
    expect(trailingStop(2, 1)).toBe(1)
  })

  it('never runs ahead of a pointer that crosses several stops at once', () => {
    expect(trailingStop(0, 2.6)).toBe(2)
    expect(trailingStop(3, 0.4)).toBe(1)
  })

  it('counts a pointer a hair short of a stop as there', () => {
    expect(trailingStop(1, 1.98)).toBe(2)
    expect(trailingStop(2, 1.02)).toBe(1)
  })
})

describe('the stretch of the track past its end', () => {
  it('does not stretch a track the pointer has not left', () => {
    expect(bandStretch(0, 28)).toBe(0)
  })

  it('grows with the reach and stops at two sevenths of the height', () => {
    expect(bandStretch(40, 28)).toBeGreaterThan(bandStretch(20, 28))
    expect(bandStretch(120, 28)).toBeCloseTo(8)
    expect(bandStretch(600, 28)).toBeCloseTo(8)
  })

  it('scales the limit with the size of the control', () => {
    expect(bandStretch(1000, 16)).toBeCloseTo(16 * (2 / 7))
  })
})

describe('keys', () => {
  it('steps with the arrows and mirrors the horizontal ones from right to left', () => {
    expect(keyStop('ArrowRight', 4, 8, false)).toBe(5)
    expect(keyStop('ArrowLeft', 4, 8, false)).toBe(3)
    expect(keyStop('ArrowRight', 4, 8, true)).toBe(3)
    expect(keyStop('ArrowLeft', 4, 8, true)).toBe(5)
    expect(keyStop('ArrowUp', 4, 8, true)).toBe(5)
    expect(keyStop('ArrowDown', 4, 8, true)).toBe(3)
  })

  it('pages by a tenth of the range and by a step at least', () => {
    expect(keyStop('PageUp', 40, 100, false)).toBe(50)
    expect(keyStop('PageDown', 40, 100, false)).toBe(30)
    expect(keyStop('PageUp', 1, 3, false)).toBe(2)
  })

  it('jumps to the ends and stops there', () => {
    expect(keyStop('Home', 4, 8, false)).toBe(0)
    expect(keyStop('End', 4, 8, false)).toBe(8)
    expect(keyStop('ArrowRight', 8, 8, false)).toBe(8)
    expect(keyStop('PageDown', 3, 100, false)).toBe(0)
  })

  it('leaves every other key alone', () => {
    expect(keyStop('Tab', 4, 8, false)).toBeUndefined()
    expect(keyStop('a', 4, 8, false)).toBeUndefined()
    expect(keyStop('toString', 4, 8, false)).toBeUndefined()
  })
})

describe('the values that size the pill', () => {
  it('takes every step of a stepped range', () => {
    expect(widestValues(EFFORT)).toEqual([0, 1, 2, 3])
  })

  it('takes the ends and their neighbours of a continuous range', () => {
    expect(widestValues(PERCENT)).toEqual([0, 1, 99, 100])
  })
})
