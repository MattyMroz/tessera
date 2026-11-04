import { afterAll, describe, expect, it, vi } from 'vitest'
import { MOTION } from '../../test/fixtures/motion'
import { milliseconds, parseMotion, readMotion } from './motion'

describe('motion outputs', () => {
  it.each([
    ['100ms', 100],
    ['.1s', 100],
    ['0.2s', 200],
    [' 150ms ', 150],
    ['0ms', 0],
    ['0s', 0],
    ['', 0],
  ])('reads the duration %j as %d ms', (value, expected) => {
    expect(milliseconds(value)).toBe(expected)
  })

  it('parses the engine outputs in the form the minified build serves them', () => {
    const outputs: Record<string, string> = {
      '--ts-motion-press-hold': '.05s',
      '--ts-motion-duration-follow': '.1s',
      '--ts-motion-duration-choice': '220ms',
      '--ts-motion-choice-overshoot': '.1',
      '--ts-motion-ease-hover': ' ease-out',
    }
    expect(parseMotion((name) => outputs[name] ?? '')).toEqual(MOTION)
  })

  it('treats missing outputs as no motion', () => {
    expect(parseMotion(() => '')).toEqual({ pressHold: 0, follow: 0, choice: 0, overshoot: 0, ease: '' })
  })

  describe('readMotion', () => {
    const page = {} as Element
    const still = {} as Element
    const outputs = new Map<string, string>([['--ts-motion-duration-follow', '.1s'], ['--ts-motion-press-hold', '.05s']])
    const style = { getPropertyValue: (name: string) => outputs.get(name) ?? '' }
    const stillStyle = { getPropertyValue: () => '0s' }
    let reads = 0
    vi.stubGlobal('getComputedStyle', (element: Element) => {
      reads++
      return element === still ? stillStyle : style
    })

    afterAll(() => {
      vi.unstubAllGlobals()
    })

    it('reads the style of the element once at every call, so a changed subtree changes the next motion', () => {
      reads = 0
      expect(readMotion(page)).toMatchObject({ follow: 100, pressHold: 50 })
      expect(reads).toBe(1)
      outputs.set('--ts-motion-duration-follow', '0s')
      outputs.set('--ts-motion-press-hold', '0s')
      expect(readMotion(page)).toMatchObject({ follow: 0, pressHold: 0 })
      expect(reads).toBe(2)
    })

    it('reads every element from its own style', () => {
      outputs.set('--ts-motion-duration-follow', '.1s')
      expect(readMotion(page).follow).toBe(100)
      expect(readMotion(still).follow).toBe(0)
    })
  })
})
