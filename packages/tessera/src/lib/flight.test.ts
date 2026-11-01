import { describe, expect, it } from 'vitest'
import { SPRING } from '../../test/fixtures/motion'
import { SAMPLE_STEP, bezierCurve, course, firmStretch, planFlight, resume, visibleAt, type Box, type Flight } from './flight'
import type { Motion } from './motion'

const ELASTIC: Motion = { ...SPRING, mode: 'elastic' }
const FIRM: Motion = { ...SPRING, mode: 'firm' }
const OFF: Motion = { ...SPRING, mode: 'off' }
const REST = { x: 0, y: 0 }
const ROW: Box = { x: 200, y: 0, width: 60, height: 28 }

function fly(motion: Motion, to: Box = ROW, from = REST, velocity = REST): Flight {
  const flight = planFlight({ from, velocity, to, motion })
  if (!flight) throw new Error('expected a flight')
  return flight
}

function trail(flight: Flight, until = flight.duration, steps = 400): number[] {
  return Array.from({ length: steps + 1 }, (_, index) => flight.at((until * index) / steps).x)
}

describe('flights', () => {
  it('stays still with motion off and for a move under half a pixel', () => {
    expect(planFlight({ from: REST, velocity: REST, to: ROW, motion: OFF })).toBeUndefined()
    expect(planFlight({ from: REST, velocity: REST, to: { ...ROW, x: 0.4 }, motion: SPRING })).toBeUndefined()
  })

  describe('spring', () => {
    const flight = fly(SPRING)
    const frames = flight.offsets.map((offset) => flight.at(offset * flight.duration).x)

    it('samples linear keyframes at the sampling step', () => {
      expect(flight.easing).toBe('linear')
      expect(flight.duration / 1000 / SAMPLE_STEP).toBeCloseTo(flight.offsets.length - 1)
      expect(flight.offsets[0]).toBe(0)
      expect(flight.offsets.at(-1)).toBe(1)
    })

    it('ends on the target once it rests within half a pixel', () => {
      expect(frames.at(-1)).toBe(200)
      expect(Math.abs((frames.at(-2) ?? 0) - 200)).toBeLessThanOrEqual(0.5)
      expect(flight.duration).toBeLessThan(1000)
    })

    it('moves forward until it reaches the target and barely overshoots', () => {
      const curve = trail(flight)
      const arrival = curve.findIndex((x) => x >= 200)
      const approach = curve.slice(0, arrival + 1)
      expect(approach.every((x, index) => index === 0 || x >= (approach[index - 1] ?? 0))).toBe(true)
      expect(Math.max(...curve)).toBeLessThan(200 * 1.005)
    })
  })

  describe('elastic', () => {
    const flight = fly(ELASTIC)

    it('lasts the elastic time of the engine', () => {
      expect(flight.duration).toBe(220)
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
      const short = fly(ELASTIC, { ...ROW, x: 4 })
      expect(Math.max(...trail(short))).toBeCloseTo(6)
    })
  })

  describe('firm', () => {
    it.each([
      [0, 40, 1],
      [1, 28, 1],
      [40, 40, 1],
      [160, 40, 1.5],
      [640, 40, 2],
      [5000, 40, 2],
      [160, 10, 1.5],
    ])('stretches a flight of %d px over a %d px target %d times', (distance, size, stretch) => {
      expect(firmStretch(distance, size)).toBeCloseTo(stretch)
    })

    it('never gets a negative time for a one pixel flight', () => {
      expect(fly(FIRM, { ...ROW, x: 1 }).duration).toBe(150)
    })

    it('runs the engine curve between two keyframes', () => {
      const flight = fly(FIRM, { ...ROW, x: 640, width: 40 })
      expect(flight.duration).toBeCloseTo(300)
      expect(flight.easing).toBe(SPRING.standard)
      expect(flight.offsets).toEqual([0, 1])
      const curve = trail(flight)
      expect(curve.every((x, index) => index === 0 || x >= (curve[index - 1] ?? 0))).toBe(true)
      expect(curve.at(-1)).toBe(640)
    })
  })

  describe('engine curves', () => {
    it.each(['cubic-bezier(0.2, 0, 0, 1)', 'cubic-bezier(.2,0,0,1)'])('reads %s', (easing) => {
      const curve = bezierCurve(easing)
      expect(curve(0).value).toBeCloseTo(0)
      expect(curve(1).value).toBeCloseTo(1)
      expect(curve(0.5).value).toBeCloseTo(bezierCurve('cubic-bezier(0.2, 0, 0, 1)')(0.5).value)
      expect(curve(0.5).value).toBeGreaterThan(0.5)
    })

    it('reads a keyword curve', () => {
      expect(bezierCurve('linear')(0.3).value).toBeCloseTo(0.3)
      expect(bezierCurve('ease-out')(0.5).value).toBeGreaterThan(0.5)
    })
  })

  describe('turning back in flight', () => {
    const first = fly(SPRING)
    const elapsed = 80
    const carried = resume(first, elapsed)
    const back: Box = { ...ROW, x: -100 }

    it('reads where the flight shows now and how fast it goes', () => {
      expect(carried?.position.x).toBeGreaterThan(0)
      expect(carried?.position.x).toBeLessThan(200)
      expect(carried?.velocity.x).toBeGreaterThan(0)
    })

    it('starts the new flight there with the carried velocity', () => {
      if (!carried) throw new Error('expected a running flight')
      const turn = fly(SPRING, back, carried.position, carried.velocity)
      const still = fly(SPRING, back, carried.position)
      expect(turn.at(0).x).toBeCloseTo(carried.position.x)
      expect(turn.velocity(0).x).toBeCloseTo(carried.velocity.x)
      expect(turn.at(1000 * SAMPLE_STEP).x).toBeGreaterThan(carried.position.x)
      expect(still.at(1000 * SAMPLE_STEP).x).toBeLessThan(carried.position.x)
      expect(turn.at(turn.duration)).toEqual(back)
    })

    it('starts from rest once the flight has ended', () => {
      expect(resume(first, first.duration)).toBeUndefined()
      expect(resume(undefined, 0)).toBeUndefined()
    })
  })
})

describe('walls', () => {
  const size = { width: 40, height: 28 }
  const walls = { start: 4, end: 204 }
  const last: Box = { x: 164, y: 0, ...size }
  const first: Box = { x: 4, y: 0, ...size }

  it('stops the leading edge on the end wall and squashes the pill toward it', () => {
    const flight = fly(ELASTIC, last, first)
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
    const { frames, wall } = course(fly(ELASTIC, first, last), size, 'x', walls)
    expect(wall).toBe('start')
    expect(frames.every((frame) => frame.x >= walls.start)).toBe(true)
  })

  it('leaves a flight that stays inside the walls as it is', () => {
    const { frames, wall } = course(fly(ELASTIC, last, first), size, 'x', { start: 0, end: 400 })
    expect(wall).toBeUndefined()
    expect(frames.every((frame) => frame.scale === 1)).toBe(true)
  })

  it('never traps a pill whose target lies past the wall', () => {
    const beyond: Box = { ...last, x: 300 }
    const { frames } = course(fly(FIRM, beyond, first), size, 'x', walls)
    expect(frames.at(-1)?.x).toBe(300)
  })

  it('reads the visible position of a squashed flight on the wall', () => {
    const flight = fly(ELASTIC, last, first)
    expect(visibleAt(flight, size, 'x', walls, 0.6 * flight.duration).x).toBe(164)
  })
})
