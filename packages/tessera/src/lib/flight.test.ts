import { describe, expect, it } from 'vitest'
import { MOTION } from '../../test/fixtures/motion'
import { bezierCurve, course, planFlight, visibleAt, type Box, type Flight, type FlightKind } from './flight'
import type { Motion } from './motion'

const REST = { x: 0, y: 0 }
const ROW: Box = { x: 200, y: 0, width: 60, height: 28 }

function fly(kind: FlightKind, to: Box = ROW, from = REST, motion: Motion = MOTION): Flight {
  const flight = planFlight({ kind, from, to, motion })
  if (!flight) throw new Error('expected a flight')
  return flight
}

function trail(flight: Flight, until = flight.duration, steps = 400): number[] {
  return Array.from({ length: steps + 1 }, (_, index) => flight.at((until * index) / steps).x)
}

describe('flights', () => {
  it.each<FlightKind>(['follow', 'choice'])('stays still for a %s of a move under half a pixel and with its time set to zero', (kind) => {
    expect(planFlight({ kind, from: REST, to: { ...ROW, x: 0.4 }, motion: MOTION })).toBeUndefined()
    expect(planFlight({ kind, from: REST, to: ROW, motion: { ...MOTION, follow: 0, choice: 0 } })).toBeUndefined()
  })

  describe('follow', () => {
    const flight = fly('follow')

    it('runs the engine curve for the follow time between two keyframes', () => {
      expect(flight.duration).toBe(100)
      expect(flight.easing).toBe(MOTION.ease)
      expect(flight.offsets).toEqual([0, 1])
    })

    it('arrives without overshoot', () => {
      const curve = trail(flight)
      expect(curve.every((x, index) => index === 0 || x >= (curve[index - 1] ?? 0))).toBe(true)
      expect(curve.at(-1)).toBe(200)
    })
  })

  describe('choice', () => {
    const flight = fly('choice')

    it('lasts the choice time of the engine on linear keyframes', () => {
      expect(flight.duration).toBe(220)
      expect(flight.easing).toBe('linear')
      expect(flight.offsets[0]).toBe(0)
      expect(flight.offsets.at(-1)).toBe(1)
      expect(flight.at(flight.duration)).toEqual(ROW)
    })

    it('peaks at 60 % with an overshoot of a tenth of the height', () => {
      expect(flight.at(0.6 * flight.duration).x).toBeCloseTo(200 + 0.1 * 28)
      expect(Math.max(...trail(flight))).toBeCloseTo(202.8)
    })

    it('climbs without a step back until the peak', () => {
      const rise = trail(flight, 0.6 * flight.duration)
      expect(rise.every((x, index) => index === 0 || x >= (rise[index - 1] ?? 0))).toBe(true)
    })

    it('overshoots at most half the distance', () => {
      const short = fly('choice', { ...ROW, x: 4 })
      expect(Math.max(...trail(short))).toBeCloseTo(6)
    })
  })

  describe('engine curves', () => {
    it.each(['cubic-bezier(0.2, 0, 0, 1)', 'cubic-bezier(.2,0,0,1)'])('reads %s', (easing) => {
      const curve = bezierCurve(easing)
      expect(curve(0)).toBeCloseTo(0)
      expect(curve(1)).toBeCloseTo(1)
      expect(curve(0.5)).toBeCloseTo(bezierCurve('cubic-bezier(0.2, 0, 0, 1)')(0.5))
      expect(curve(0.5)).toBeGreaterThan(0.5)
    })

    it('reads a keyword curve', () => {
      expect(bezierCurve('linear')(0.3)).toBeCloseTo(0.3)
      expect(bezierCurve('ease-out')(0.5)).toBeGreaterThan(0.5)
    })
  })
})

describe('walls', () => {
  const size = { width: 40, height: 28 }
  const walls = { start: 4, end: 204 }
  const last: Box = { x: 164, y: 0, ...size }
  const first: Box = { x: 4, y: 0, ...size }

  it('stops the leading edge on the end wall and squashes the pill toward it', () => {
    const flight = fly('choice', last, first)
    const { frames, wall } = course(flight, size, 'x', walls)
    expect(wall).toBe('end')
    for (const frame of frames) {
      expect(frame.x + size.width).toBeLessThanOrEqual(walls.end + 1e-9)
      const trailing = walls.end - size.width * frame.scale
      if (frame.scale < 1) expect(trailing).toBeCloseTo(flight.at(frame.offset * flight.duration).x)
    }
    expect(Math.min(...frames.map((frame) => frame.scale))).toBeGreaterThanOrEqual((size.width - 2.8) / size.width - 1e-9)
    expect(Math.min(...frames.map((frame) => frame.scale))).toBeLessThan(1)
    expect(frames.at(-1)).toEqual({ offset: 1, x: 164, y: 0, scale: 1 })
  })

  it('squashes toward the start wall when it flies back', () => {
    const { frames, wall } = course(fly('choice', first, last), size, 'x', walls)
    expect(wall).toBe('start')
    expect(frames.every((frame) => frame.x >= walls.start)).toBe(true)
  })

  it('leaves a flight that stays inside the walls as it is', () => {
    const { frames, wall } = course(fly('choice', last, first), size, 'x', { start: 0, end: 400 })
    expect(wall).toBeUndefined()
    expect(frames.every((frame) => frame.scale === 1)).toBe(true)
  })

  it('never squashes a follow, which does not overshoot', () => {
    const beyond: Box = { ...last, x: 300 }
    const { frames, wall } = course(fly('follow', beyond, first), size, 'x', walls)
    expect(wall).toBeUndefined()
    expect(frames.at(-1)?.x).toBe(300)
  })

  it('reads the visible position of a squashed flight on the wall', () => {
    const flight = fly('choice', last, first)
    expect(visibleAt(flight, size, 'x', walls, 0.6 * flight.duration).x).toBe(164)
  })
})
