export type ArrowEdge = {
  readonly size: number
  readonly length: number
  readonly across: number
  readonly radius: number
  readonly offset: number
  readonly direction: 1 | -1
}

type Point = { readonly x: number; readonly y: number }

type Rim = { readonly corner: number; readonly centre: number; readonly end: number }

const TIP_SHARE = 4
const DIGITS = 3

function rimBefore(edge: ArrowEdge): Rim {
  const corner = Math.min(edge.radius, edge.length / 2, edge.across / 2)
  const end = Math.min(-edge.offset * edge.direction, (edge.length - edge.offset) * edge.direction)
  return { corner, centre: end + corner, end }
}

function depthAt(rim: Rim, x: number): number {
  if (x >= rim.centre) return 0
  if (x <= rim.end) return rim.corner
  return rim.corner - Math.sqrt(rim.corner ** 2 - (x - rim.centre) ** 2)
}

function slopeAt(rim: Rim, x: number): number {
  if (x >= rim.centre || x <= rim.end) return 0
  return (x - rim.centre) / Math.sqrt(rim.corner ** 2 - (x - rim.centre) ** 2)
}

function flankMeetsRim(rim: Rim, reach: number): number {
  if (-reach >= rim.centre) return -reach
  const lift = rim.centre + reach + rim.corner
  const room = rim.corner ** 2 * 2 - lift ** 2
  if (room < 0) return rim.end
  return rim.centre + (Math.sqrt(room) - lift) / 2
}

function blend(rim: Rim, reach: number, round: number): { edge: Point; control: Point; flank: Point } {
  const x = Math.max(flankMeetsRim(rim, reach) - round, rim.end)
  const edge = { x, y: depthAt(rim, x) }
  const slope = slopeAt(rim, x)
  const cx = (slope * edge.x - reach - edge.y) / (slope + 1)
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

export function drawArrow(arrow: SVGSVGElement, edge: ArrowEdge): void {
  const box = `${-edge.size} ${-edge.size} ${edge.size * 2} ${edge.size * 2}`
  const shape = arrowPath(edge)
  const path = arrow.firstElementChild
  if (arrow.getAttribute('viewBox') !== box) arrow.setAttribute('viewBox', box)
  if (path && path.getAttribute('d') !== shape) path.setAttribute('d', shape)
}

export function arrowPath(edge: ArrowEdge): string {
  const reach = edge.size * Math.SQRT1_2
  const round = edge.size / TIP_SHARE
  const start = blend(rimBefore(edge), reach, round)
  const end = blend(rimBefore({ ...edge, direction: edge.direction === 1 ? -1 : 1 }), reach, round)
  const tip = { x: -round * Math.SQRT1_2, y: -reach + round * Math.SQRT1_2 }
  const floor = Math.max(edge.size / 2, start.edge.y, end.edge.y)
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
