export type ArrowEdge = {
  readonly size: number
  readonly length: number
  readonly across: number
  readonly radius: number
  readonly offset: number
  readonly direction: 1 | -1
}

type Point = { readonly x: number; readonly y: number }

const TIP_SHARE = 4
const SEARCH_STEPS = 48
const SLOPE_STEP = 1 / 64
const DIGITS = 3

function depthAt(edge: ArrowEdge, x: number): number {
  const corner = Math.min(edge.radius, edge.length / 2, edge.across / 2)
  const along = edge.offset + edge.direction * x
  const distance = Math.min(along, edge.length - along)
  if (distance >= corner) return 0
  if (distance <= 0) return corner
  return corner - Math.sqrt(corner * corner - (corner - distance) ** 2)
}

function flankMeetsEdge(depth: (x: number) => number, reach: number, limit: number): number {
  const gap = (x: number): number => -x - reach - depth(x)
  if (gap(-reach) >= 0) return -reach
  const stride = (limit - reach) / SEARCH_STEPS
  let near = -reach
  let far = near - stride
  while (gap(far) <= 0) {
    if (far <= -limit) return -limit
    near = far
    far -= stride
  }
  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const middle = (near + far) / 2
    if (gap(middle) > 0) far = middle
    else near = middle
  }
  return (near + far) / 2
}

function blend(depth: (x: number) => number, reach: number, size: number, round: number): { edge: Point; control: Point; flank: Point } {
  const meet = flankMeetsEdge(depth, reach, size + size)
  const x = meet - round
  const edge = { x, y: depth(x) }
  const slope = (depth(x + SLOPE_STEP) - depth(x - SLOPE_STEP)) / (SLOPE_STEP * 2)
  const cx = (-reach - edge.y + slope * edge.x) / (slope + 1)
  const control = { x: cx, y: -cx - reach }
  const span = Math.hypot(control.x - edge.x, control.y - edge.y)
  const flank = { x: control.x + span * Math.SQRT1_2, y: control.y - span * Math.SQRT1_2 }
  return { edge, control, flank }
}

function mirror(point: Point): Point {
  return { x: -point.x, y: point.y }
}

function format(value: number): string {
  return Number(value.toFixed(DIGITS)).toString()
}

function at(point: Point): string {
  return `${format(point.x)} ${format(point.y)}`
}

export function arrowPath(edge: ArrowEdge): string {
  const { size } = edge
  const reach = size * Math.SQRT1_2
  const round = size / TIP_SHARE
  const start = blend((x) => depthAt(edge, x), reach, size, round)
  const end = blend((x) => depthAt(edge, -x), reach, size, round)
  const tip = { x: -round * Math.SQRT1_2, y: -reach + round * Math.SQRT1_2 }
  const floor = Math.max(size / 2, start.edge.y, end.edge.y)
  return [
    `M${at(start.edge)}`,
    `Q${at(start.control)} ${at(start.flank)}`,
    `L${at(tip)}`,
    `A${format(round)} ${format(round)} 0 0 1 ${at(mirror(tip))}`,
    `L${at(mirror(end.flank))}`,
    `Q${at(mirror(end.control))} ${at(mirror(end.edge))}`,
    `V${format(floor)}`,
    `H${format(start.edge.x)}`,
    'Z',
  ].join('')
}
