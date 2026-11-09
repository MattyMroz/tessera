export type Range = { readonly min: number; readonly max: number; readonly step: number }

export const MAX_MARKS = 12
export const TAP_SLOP = 3

const BAND_SHARE = 2 / 7
const BAND_RUN = 15
const REACH = 0.03
const PAGE_SHARE = 10
const DECIMAL = 10

export function stopsOf({ min, max, step }: Range): number {
  return Math.max(1, Math.round((max - min) / step))
}

export function isStepped(range: Range): boolean {
  return stopsOf(range) <= MAX_MARKS
}

function decimalsOf(step: number): number {
  const [, decimals = ''] = String(step).split('.')
  return decimals.length
}

function settled(value: number, { min, max, step }: Range): number {
  const scale = DECIMAL ** decimalsOf(step)
  return Math.min(max, Math.max(min, Math.round(value * scale) / scale))
}

export function valueOfStop(stop: number, range: Range): number {
  return settled(range.min + stop * range.step, range)
}

export function fractionOf(value: number, range: Range): number {
  return Math.min(1, Math.max(0, (value - range.min) / (range.max - range.min)))
}

export function trailingStop(stop: number | null, position: number): number {
  if (stop === null) return Math.round(position)
  if (position >= stop + 1 - REACH) return Math.floor(position + REACH)
  if (position <= stop - 1 + REACH) return Math.ceil(position - REACH)
  return stop
}

export function bandStretch(reach: number, height: number): number {
  const limit = height * BAND_SHARE
  const part = Math.min(1, reach / (limit * BAND_RUN))
  return limit * (1 - (1 - part) ** 2)
}

export function keyStop(key: string, stop: number, stops: number, rtl: boolean): number | undefined {
  const page = Math.max(1, Math.round(stops / PAGE_SHARE))
  const moves: Readonly<Record<string, number>> = {
    [rtl ? 'ArrowLeft' : 'ArrowRight']: stop + 1,
    [rtl ? 'ArrowRight' : 'ArrowLeft']: stop - 1,
    ArrowUp: stop + 1,
    ArrowDown: stop - 1,
    PageUp: stop + page,
    PageDown: stop - page,
    Home: 0,
    End: stops,
  }
  const moved = Object.hasOwn(moves, key) ? moves[key] : undefined
  return moved === undefined ? undefined : Math.min(stops, Math.max(0, moved))
}

export function widestValues(range: Range): number[] {
  const stops = stopsOf(range)
  const picked = isStepped(range) ? Array.from({ length: stops + 1 }, (_, stop) => stop) : [0, 1, stops - 1, stops]
  return [...new Set(picked.map((stop) => valueOfStop(stop, range)))]
}
