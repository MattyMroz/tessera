import { MILLISECONDS_PER_SECOND, type Motion } from './motion'

export type Point = { readonly x: number; readonly y: number }
export type Box = Point & { readonly width: number; readonly height: number }
export type Rect = { readonly left: number; readonly top: number; readonly width: number; readonly height: number }
export type Size = { readonly width: number; readonly height: number }
export type ScreenAxis = 'x' | 'y'
export type Wall = 'start' | 'end'
export type Walls = { readonly start: number; readonly end: number }

export type Flight = {
  readonly from: Point
  readonly to: Point
  readonly duration: number
  readonly easing: string
  readonly offsets: readonly number[]
  at(elapsed: number): Point
  velocity(elapsed: number): Point
}

export type FlightRequest = {
  readonly from: Point
  readonly velocity: Point
  readonly to: Box
  readonly motion: Motion
}

export type CourseFrame = Point & { readonly offset: number; readonly scale: number }
export type Course = { readonly frames: readonly CourseFrame[]; readonly wall: Wall | undefined }

export const SAMPLE_STEP = 1 / 60
export const SETTLED = 0.5
export const NO_SPEED: Point = { x: 0, y: 0 }

const REST_SPEED = 2
const MAX_SAMPLES = 600
const ELASTIC_PEAK = 0.6
const FIRM_GAIN = 0.25
const FIRM_MIN_STEP = 40
const FIRM_MAX_STRETCH = 2
const SOLVE_STEPS = 24
const SOLVE_PRECISION = 1e-7
const LINEAR_CURVE: readonly number[] = [0, 0, 1, 1]
const CURVE_KEYWORDS: Readonly<Record<string, readonly number[]>> = {
  linear: LINEAR_CURVE,
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
}

type Sample = { readonly offset: number; readonly speed: number }
type Oscillator = (seconds: number) => Sample

function oscillator(stiffness: number, damping: number, start: number, speed: number): Oscillator {
  const natural = Math.sqrt(stiffness)
  const ratio = damping / (2 * natural)
  if (ratio < 1) {
    const decay = ratio * natural
    const frequency = natural * Math.sqrt(1 - ratio * ratio)
    const phase = (speed + decay * start) / frequency
    return (seconds) => {
      const envelope = Math.exp(-decay * seconds)
      const cos = Math.cos(frequency * seconds)
      const sin = Math.sin(frequency * seconds)
      return {
        offset: envelope * (start * cos + phase * sin),
        speed: envelope * ((phase * frequency - decay * start) * cos - (start * frequency + decay * phase) * sin),
      }
    }
  }
  if (ratio === 1) {
    const lead = speed + natural * start
    return (seconds) => {
      const envelope = Math.exp(-natural * seconds)
      return { offset: envelope * (start + lead * seconds), speed: envelope * (speed - natural * lead * seconds) }
    }
  }
  const spread = natural * Math.sqrt(ratio * ratio - 1)
  const slow = -natural * ratio + spread
  const quick = -natural * ratio - spread
  const slowPart = (speed - quick * start) / (slow - quick)
  const quickPart = start - slowPart
  return (seconds) => {
    const slowTerm = slowPart * Math.exp(slow * seconds)
    const quickTerm = quickPart * Math.exp(quick * seconds)
    return { offset: slowTerm + quickTerm, speed: slow * slowTerm + quick * quickTerm }
  }
}

function sampledOffsets(samples: number): number[] {
  return Array.from({ length: samples + 1 }, (_, index) => index / samples)
}

function springFlight(from: Point, velocity: Point, to: Point, motion: Motion): Flight | undefined {
  if (motion.stiffness <= 0 || motion.damping <= 0) return undefined
  const x = oscillator(motion.stiffness, motion.damping, from.x - to.x, velocity.x)
  const y = oscillator(motion.stiffness, motion.damping, from.y - to.y, velocity.y)
  const rests = (seconds: number): boolean =>
    [x(seconds), y(seconds)].every((sample) => Math.abs(sample.offset) <= SETTLED && Math.abs(sample.speed) <= REST_SPEED)
  let samples = 1
  while (samples < MAX_SAMPLES && !rests(samples * SAMPLE_STEP)) samples++
  const duration = samples * SAMPLE_STEP * MILLISECONDS_PER_SECOND
  return {
    from,
    to,
    duration,
    easing: 'linear',
    offsets: sampledOffsets(samples),
    at: (elapsed) => {
      if (elapsed >= duration) return to
      const seconds = elapsed / MILLISECONDS_PER_SECOND
      return { x: to.x + x(seconds).offset, y: to.y + y(seconds).offset }
    },
    velocity: (elapsed) => {
      if (elapsed >= duration) return NO_SPEED
      const seconds = elapsed / MILLISECONDS_PER_SECOND
      return { x: x(seconds).speed, y: y(seconds).speed }
    },
  }
}

type Progress = { readonly value: number; readonly slope: number }
type Curve = (fraction: number) => Progress

function elasticCurve(overshoot: number): Curve {
  return (fraction) => {
    if (fraction <= ELASTIC_PEAK) {
      const rest = 1 - fraction / ELASTIC_PEAK
      return { value: (1 + overshoot) * (1 - rest ** 3), slope: (3 * (1 + overshoot) * rest ** 2) / ELASTIC_PEAK }
    }
    const back = (fraction - ELASTIC_PEAK) / (1 - ELASTIC_PEAK)
    return {
      value: 1 + overshoot * (1 - back * back * (3 - 2 * back)),
      slope: (-overshoot * 6 * back * (1 - back)) / (1 - ELASTIC_PEAK),
    }
  }
}

function cubic(first: number, second: number, at: number): number {
  const rest = 1 - at
  return 3 * rest * rest * at * first + 3 * rest * at * at * second + at * at * at
}

function cubicSlope(first: number, second: number, at: number): number {
  const rest = 1 - at
  return 3 * rest * rest * first + 6 * rest * at * (second - first) + 3 * at * at * (1 - second)
}

export function bezierCurve(easing: string): Curve {
  const text = easing.trim()
  const numbers = /^cubic-bezier\(([^)]*)\)$/.exec(text)?.[1]?.split(',').map(Number)
  const points = numbers?.length === 4 && numbers.every(Number.isFinite) ? numbers : (CURVE_KEYWORDS[text] ?? LINEAR_CURVE)
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = points
  return (fraction) => {
    let low = 0
    let high = 1
    let at = fraction
    for (let step = 0; step < SOLVE_STEPS; step++) {
      const error = cubic(x1, x2, at) - fraction
      if (Math.abs(error) < SOLVE_PRECISION) break
      if (error > 0) high = at
      else low = at
      const slope = cubicSlope(x1, x2, at)
      const next = slope === 0 ? Number.NaN : at - error / slope
      at = next > low && next < high ? next : (low + high) / 2
    }
    const run = cubicSlope(x1, x2, at)
    return { value: cubic(y1, y2, at), slope: run === 0 ? 0 : cubicSlope(y1, y2, at) / run }
  }
}

function curveFlight(from: Point, to: Point, duration: number, easing: string, offsets: readonly number[], curve: Curve): Flight {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const progress = (elapsed: number): Progress => curve(Math.min(Math.max(elapsed / duration, 0), 1))
  return {
    from,
    to,
    duration,
    easing,
    offsets,
    at: (elapsed) => {
      if (elapsed >= duration) return to
      const { value } = progress(elapsed)
      return { x: from.x + dx * value, y: from.y + dy * value }
    },
    velocity: (elapsed) => {
      if (elapsed >= duration) return NO_SPEED
      const perSecond = (progress(elapsed).slope * MILLISECONDS_PER_SECOND) / duration
      return { x: dx * perSecond, y: dy * perSecond }
    },
  }
}

export function firmStretch(distance: number, size: number): number {
  const stretch = 1 + FIRM_GAIN * Math.log2(distance / Math.max(size, FIRM_MIN_STEP))
  return Math.min(Math.max(stretch, 1), FIRM_MAX_STRETCH)
}

export function planFlight({ from, velocity, to, motion }: FlightRequest): Flight | undefined {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)
  if (motion.mode === 'off' || distance < SETTLED) return undefined
  if (motion.mode === 'spring') return springFlight(from, velocity, to, motion)
  if (motion.mode === 'elastic') {
    if (motion.elastic <= 0) return undefined
    const reach = Math.min(motion.overshoot * to.height, distance / 2)
    const samples = Math.max(1, Math.ceil(motion.elastic / MILLISECONDS_PER_SECOND / SAMPLE_STEP))
    return curveFlight(from, to, motion.elastic, 'linear', sampledOffsets(samples), elasticCurve(reach / distance))
  }
  if (motion.slide <= 0) return undefined
  const size = Math.abs(dy) > Math.abs(dx) ? to.height : to.width
  const duration = motion.slide * firmStretch(distance, size)
  return curveFlight(from, to, duration, motion.standard, [0, 1], bezierCurve(motion.standard))
}

export function resume(flight: Flight | undefined, elapsed: number): { readonly position: Point; readonly velocity: Point } | undefined {
  if (!flight || elapsed >= flight.duration) return undefined
  return { position: flight.at(elapsed), velocity: flight.velocity(elapsed) }
}

type Bounds = { readonly axis: ScreenAxis; readonly start: number; readonly end: number; readonly size: number; readonly wall: Wall }

function boundsOf(flight: Flight, size: Size, axis: ScreenAxis, walls: Walls): Bounds {
  const extent = axis === 'x' ? size.width : size.height
  const from = flight.from[axis]
  const to = flight.to[axis]
  return {
    axis,
    start: Math.min(walls.start, from, to),
    end: Math.max(walls.end, from + extent, to + extent),
    size: extent,
    wall: to >= from ? 'end' : 'start',
  }
}

function clampAt(point: Point, bounds: Bounds): { readonly point: Point; readonly scale: number } {
  const lead = point[bounds.axis]
  const overflow = bounds.wall === 'end' ? lead + bounds.size - bounds.end : bounds.start - lead
  if (overflow <= 0 || bounds.size <= 0) return { point, scale: 1 }
  const clamped = bounds.wall === 'end' ? bounds.end - bounds.size : bounds.start
  return { point: { ...point, [bounds.axis]: clamped }, scale: Math.max(0, (bounds.size - overflow) / bounds.size) }
}

export function course(flight: Flight, size: Size, axis: ScreenAxis, walls: Walls): Course {
  const bounds = boundsOf(flight, size, axis, walls)
  const frames = flight.offsets.map((offset) => {
    const { point, scale } = clampAt(flight.at(offset * flight.duration), bounds)
    return { offset, x: point.x, y: point.y, scale }
  })
  return { frames, wall: frames.some((frame) => frame.scale < 1) ? bounds.wall : undefined }
}

export function visibleAt(flight: Flight, size: Size, axis: ScreenAxis, walls: Walls, elapsed: number): Point {
  return clampAt(flight.at(elapsed), boundsOf(flight, size, axis, walls)).point
}
