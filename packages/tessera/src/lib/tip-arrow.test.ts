import { describe, expect, it } from 'vitest'
import { arrowPath } from './tip-arrow'

function numbers(path: string): number[] {
  return (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
}

function start(path: string): { x: number; y: number } {
  const [x = 0, y = 0] = numbers(path)
  return { x, y }
}

describe('arrowPath', () => {
  it('meets a straight edge on the edge itself and keeps the rounded tip of the old square', () => {
    const path = arrowPath({ size: 16, length: 200, across: 64, radius: 32, offset: 100, direction: 1 })
    expect(start(path).y).toBe(0)
    expect(path).toContain('L-2.828 -8.485A4 4 0 0 1 2.828 -8.485')
  })

  it('starts the blend on the arc of a capsule end, never outside it', () => {
    const path = arrowPath({ size: 16, length: 64, across: 200, radius: 32, offset: 32, direction: 1 })
    const { x, y } = start(path)
    const arc = 32 - Math.sqrt(32 * 32 - x * x)
    expect(y).toBeCloseTo(arc, 2)
    expect(y).toBeGreaterThan(0)
  })

  it('draws the same arrow from both ends of a symmetric edge', () => {
    const path = arrowPath({ size: 16, length: 64, across: 200, radius: 32, offset: 32, direction: 1 })
    const all = numbers(path)
    const first = start(path)
    expect(all).toContain(-first.x)
  })
})
