import { MILLISECONDS_PER_SECOND, type Motion } from './motion'

export type Point = { readonly x: number; readonly y: number }
export type Box = Point & { readonly width: number; readonly height: number }
export type Rect = { readonly left: number; readonly top: number; readonly width: number; readonly height: number }
export type Size = { readonly width: number; readonly height: number }
export type ScreenAxis = 'x' | 'y'
export type Wall = 'start' | 'end'
export type Walls = { readonly start: number; readonly end: number }
export type FlightKind = 'follow' | 'choice'

export type Flight = {
  readonly from: Point
  readonly to: Point
  readonly duration: number
  readonly easing: string
  readonly offsets: readonly number[]
  at(elapsed: number): Point
}

export type FlightRequest = {
  readonly kind: FlightKind
  readonly from: Point
  readonly to: Box
  readonly motion: Motion
}

export type CourseFrame = Point & { readonly offset: number; readonly scale: number }
export type Course = { readonly frames: readonly CourseFrame[]; readonly wall: Wall | undefined }

export const SAMPLE_STEP = 1 / 60
export const SETTLED = 0.5

const ELASTIC_PEAK = 0.6
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

type Curve = (fraction: number) => number

function sampledOffsets(samples: number): number[] {
  return Array.from({ length: samples + 1 }, (_, index) => index / samples)
}

function elasticCurve(overshoot: number): Curve {
  return (fraction) => {
    if (fraction <= ELASTIC_PEAK) return (1 + overshoot) * (1 - (1 - fraction / ELASTIC_PEAK) ** 3)
    const back = (fraction - ELASTIC_PEAK) / (1 - ELASTIC_PEAK)
    return 1 + overshoot * (1 - back * back * (3 - 2 * back))
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
    return cubic(y1, y2, at)
  }
}

function curveFlight(from: Point, to: Point, duration: number, easing: string, offsets: readonly number[], curve: Curve): Flight {
  const dx = to.x - from.x
  const dy = to.y - from.y
  return {
    from,
    to,
    duration,
    easing,
    offsets,
    at: (elapsed) => {
      if (elapsed >= duration) return to
      const value = curve(Math.min(Math.max(elapsed / duration, 0), 1))
      return { x: from.x + dx * value, y: from.y + dy * value }
    },
  }
}

export function planFlight({ kind, from, to, motion }: FlightRequest): Flight | undefined {
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  if (distance < SETTLED) return undefined
  if (kind === 'follow') {
    if (motion.follow <= 0) return undefined
    return curveFlight(from, to, motion.follow, motion.ease, [0, 1], bezierCurve(motion.ease))
  }
  if (motion.choice <= 0) return undefined
  const reach = Math.min(motion.overshoot * to.height, distance / 2)
  const samples = Math.max(1, Math.ceil(motion.choice / MILLISECONDS_PER_SECOND / SAMPLE_STEP))
  return curveFlight(from, to, motion.choice, 'linear', sampledOffsets(samples), elasticCurve(reach / distance))
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
