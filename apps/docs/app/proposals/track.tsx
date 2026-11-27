'use client'

import { fractionOf, isStepped, keyStop, stopsOf, TAP_SLOP, trailingStop, valueOfStop, type Range } from '@mattymroz/tessera/lib/range'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

export type TrackLook = 'line' | 'timeline' | 'mini' | 'square' | 'capsule'

type TrackProps = {
  readonly look: TrackLook
  readonly min: number
  readonly max: number
  readonly step?: number
  readonly value: number
  readonly onValueChange: (value: number) => void
  readonly format?: (value: number) => string
  readonly bubble?: 'drag' | 'peek'
  readonly marks?: boolean
  readonly start?: ReactNode
  readonly end?: ReactNode
  readonly 'aria-label': string
}

type Held = {
  readonly left: number
  readonly width: number
  readonly span: number
  readonly offset: number
  readonly downX: number
  readonly lands: number
  tapped: boolean
  stop: number | null
}

type Live = {
  readonly fraction: number
  readonly push: number
  readonly stretch: number
  readonly glide: number | null
  readonly tracking: boolean
}

const PRIMARY_BUTTON = 0
const GRAB_REACH = 8
const PUSH_LIMIT = 8
const PUSH_RUN = 120
const SQUISH = 0.14

export function rubber(reach: number, limit: number, run: number): number {
  const part = Math.min(1, Math.abs(reach) / run)
  return Math.sign(reach) * limit * (1 - (1 - part) ** 2)
}

function unit(fraction: number): number {
  return Math.min(1, Math.max(0, fraction))
}

export function Track({ look, min, max, step, value, onValueChange, format, bubble, marks, start, end, 'aria-label': name }: TrackProps) {
  const range: Range = { min, max, step: step ?? 1 }
  const text = format ?? String
  const stops = stopsOf(range)
  const stepped = isStepped(range)
  const lane = useRef<HTMLSpanElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const held = useRef<Held | null>(null)
  const landing = useRef<number | undefined>(undefined)
  const [live, setLive] = useState<Live | null>(null)
  const [wall, setWall] = useState<'start' | 'end'>('end')
  const [peek, setPeek] = useState(0)
  const fraction = live?.fraction ?? fractionOf(value, range)
  const push = live?.push ?? 0

  useEffect(() => () => window.clearTimeout(landing.current), [])

  const choose = (stop: number): void => {
    const next = valueOfStop(stop, range)
    if (next !== value) onValueChange(next)
  }

  const place = (x: number, now: number, grip: Held): void => {
    const raw = (x - grip.offset - grip.left) / grip.width
    const at = unit(raw)
    const over = (raw - at) * grip.width
    const pushed = rubber(over, PUSH_LIMIT, PUSH_RUN)
    const left = grip.lands - now
    if (stepped) grip.stop = trailingStop(grip.stop, at * stops)
    const stop = stepped && grip.stop !== null ? grip.stop : Math.round(at * stops)
    setLive({
      fraction: stepped ? stop / stops : at,
      push: pushed,
      stretch: Math.abs(pushed) / grip.span,
      glide: !stepped && left > 0 ? left : null,
      tracking: !stepped && left <= 0,
    })
    if (over !== 0) setWall(over > 0 ? 'end' : 'start')
    choose(stop)
  }

  const down = (event: PointerEvent<HTMLDivElement>): void => {
    const track = lane.current?.getBoundingClientRect()
    const knob = thumb.current?.getBoundingClientRect()
    if (event.button !== PRIMARY_BUTTON || !track || !knob || track.width === 0) return
    const centre = knob.left + knob.width / 2
    const onThumb = Math.abs(event.clientX - centre) <= knob.width / 2 + GRAB_REACH
    const follow = Number.parseFloat(getComputedStyle(event.currentTarget).getPropertyValue('--ts-motion-duration-follow')) || 0
    const grip: Held = {
      left: track.left,
      width: track.width,
      span: event.currentTarget.getBoundingClientRect().width,
      offset: onThumb ? event.clientX - centre : 0,
      downX: event.clientX,
      lands: onThumb ? event.timeStamp : event.timeStamp + follow,
      tapped: onThumb,
      stop: onThumb ? Math.round(fractionOf(value, range) * stops) : null,
    }
    held.current = grip
    event.currentTarget.setPointerCapture(event.pointerId)
    window.clearTimeout(landing.current)
    if (onThumb) {
      setLive({ fraction: fractionOf(value, range), push: 0, stretch: 0, glide: null, tracking: !stepped })
      return
    }
    place(event.clientX, event.timeStamp, grip)
    if (!stepped) landing.current = window.setTimeout(() => setLive((now) => (now ? { ...now, glide: null, tracking: true } : now)), follow)
  }

  const move = (event: PointerEvent<HTMLDivElement>): void => {
    const grip = held.current
    if (!grip) {
      const track = bubble === 'peek' ? lane.current?.getBoundingClientRect() : undefined
      if (track && track.width > 0) setPeek(unit((event.clientX - track.left) / track.width))
      return
    }
    if (Math.abs(event.clientX - grip.downX) > TAP_SLOP) grip.tapped = false
    if (grip.tapped) return
    place(event.clientX, event.timeStamp, grip)
  }

  const up = (): void => {
    const grip = held.current
    if (!grip) return
    held.current = null
    window.clearTimeout(landing.current)
    if (grip.tapped) choose(Math.round(unit((grip.downX - grip.left) / grip.width) * stops))
    setPeek(live?.fraction ?? peek)
    setLive(null)
  }

  const key = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (held.current || event.altKey || event.ctrlKey || event.metaKey) return
    const current = Math.round(fractionOf(value, range) * stops)
    const stop = keyStop(event.key, current, stops, false)
    if (stop === undefined) return
    event.preventDefault()
    choose(stop)
  }

  const peeked = live ? fraction : peek
  const rootStyle = {
    '--pt-push': `${push}px`,
    '--pt-stretch': live?.stretch ?? 0,
    '--pt-squish': (Math.abs(push) / PUSH_LIMIT) * SQUISH,
    ...(live?.glide == null ? {} : { '--pt-glide': `${live.glide}ms` }),
  } as CSSProperties
  const hostStyle = { '--pt-value': fraction, '--pt-peek': peeked } as CSSProperties

  return (
    <div
      className="pt"
      data-look={look}
      data-stepped={stepped ? '' : undefined}
      data-dragging={live ? '' : undefined}
      data-tracking={live?.tracking ? '' : undefined}
      data-over={push === 0 ? undefined : ''}
      data-wall={wall}
      style={rootStyle}
    >
      {start != null && (
        <span className="pt-side" data-side="start">
          {start}
        </span>
      )}
      <div
        className="pt-host"
        role="slider"
        tabIndex={0}
        aria-label={name}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={text(value)}
        style={hostStyle}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
      >
        <span className="pt-groove" aria-hidden="true">
          {bubble === 'peek' && <span className="pt-ghost" />}
          <span className="pt-fill" />
        </span>
        <span ref={lane} className="pt-lane" aria-hidden="true">
          {marks &&
            Array.from({ length: stops + 1 }, (_, stop) => (
              <span key={stop} className="pt-mark" style={{ '--pt-at': stop / stops } as CSSProperties} />
            ))}
          <span className="pt-ride">
            <span className="pt-shift">
              <span ref={thumb} className="pt-thumb" />
              {bubble === 'drag' && <span className="pt-bubble">{text(value)}</span>}
            </span>
          </span>
          {bubble === 'peek' && (
            <span className="pt-peek">
              <span className="pt-bubble">{text(live ? value : valueOfStop(Math.round(peek * stops), range))}</span>
            </span>
          )}
        </span>
      </div>
      {end != null && (
        <span className="pt-side" data-side="end">
          {end}
        </span>
      )}
    </div>
  )
}
