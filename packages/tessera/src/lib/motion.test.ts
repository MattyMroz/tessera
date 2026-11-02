import { afterAll, describe, expect, it, vi } from 'vitest'
import { SPRING } from '../../test/fixtures/motion'
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
      '--ts-motion-mode': ' elastic',
      '--ts-motion-press-hold': '.1s',
      '--ts-motion-duration-slide': '.15s',
      '--ts-motion-duration-elastic': '220ms',
      '--ts-motion-ease-standard': ' cubic-bezier(.2,0,0,1)',
      '--ts-motion-spring-stiffness': '420',
      '--ts-motion-spring-damping': '36',
      '--ts-motion-elastic-overshoot': '.1',
    }
    expect(parseMotion((name) => outputs[name] ?? '')).toEqual({
      ...SPRING,
      mode: 'elastic',
      standard: 'cubic-bezier(.2,0,0,1)',
    })
  })

  it('treats a missing or unknown mode as no motion', () => {
    expect(parseMotion(() => '').mode).toBe('off')
    expect(parseMotion((name) => (name === '--ts-motion-mode' ? 'bouncy' : '')).mode).toBe('off')
  })

  describe('readMotion', () => {
    const page = {} as Element
    const still = {} as Element
    const outputs = new Map<string, string>([['--ts-motion-mode', 'spring'], ['--ts-motion-press-hold', '.1s']])
    const style = { getPropertyValue: (name: string) => outputs.get(name) ?? '' }
    const stillStyle = { getPropertyValue: (name: string) => (name === '--ts-motion-mode' ? 'off' : '') }
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
      expect(readMotion(page)).toMatchObject({ mode: 'spring', pressHold: 100 })
      expect(reads).toBe(1)
      outputs.set('--ts-motion-mode', 'off')
      outputs.set('--ts-motion-press-hold', '0s')
      expect(readMotion(page)).toMatchObject({ mode: 'off', pressHold: 0 })
      expect(reads).toBe(2)
    })

    it('reads every element from its own style', () => {
      outputs.set('--ts-motion-mode', 'spring')
      expect(readMotion(page).mode).toBe('spring')
      expect(readMotion(still).mode).toBe('off')
    })
  })
})
