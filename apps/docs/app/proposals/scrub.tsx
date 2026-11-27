'use client'

import { Input } from '@mattymroz/tessera/components/input/input'
import { TAP_SLOP } from '@mattymroz/tessera/lib/range'
import { useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import { rubber } from './track'

type ScrubProps = {
  readonly label?: ReactNode
  readonly value: number
  readonly onValueChange: (value: number) => void
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly unit?: string
  readonly plain?: boolean
  readonly 'aria-label': string
}

type Held = { readonly downX: number; readonly from: number; readonly width: number; moved: boolean }

type Pull = { readonly stretch: number; readonly wall: 'start' | 'end' }

const PRIMARY_BUTTON = 0
const SHIFT_FACTOR = 10
const STRETCH_SHARE = 0.05
const STRETCH_LIMIT = 8
const STRETCH_RUN = 120

function decimalsOf(step: number): number {
  const [, decimals = ''] = String(step).split('.')
  return decimals.length
}

export function Scrub({ label, value, onValueChange, min, max, step: everyStep, unit, plain, 'aria-label': name }: ScrubProps) {
  const step = everyStep ?? 1
  const low = min ?? Number.NEGATIVE_INFINITY
  const high = max ?? Number.POSITIVE_INFINITY
  const ranged = min !== undefined && max !== undefined && !plain
  const decimals = decimalsOf(step)
  const host = useRef<HTMLDivElement>(null)
  const held = useRef<Held | null>(null)
  const [draft, setDraft] = useState<string | null>(null)
  const [scrubbing, setScrubbing] = useState(false)
  const [pull, setPull] = useState<Pull>({ stretch: 0, wall: 'end' })
  const shown = value.toFixed(decimals)

  const settled = (wanted: number): number => Number(Math.min(high, Math.max(low, Math.round(wanted / step) * step)).toFixed(decimals))

  const field = (): HTMLInputElement | null => host.current?.querySelector('input') ?? null

  const editing = (): boolean => document.activeElement === field()

  const commit = (): void => {
    if (draft === null) return
    const typed = Number.parseFloat(draft.replace(',', '.'))
    if (Number.isFinite(typed)) onValueChange(settled(typed))
    setDraft(null)
  }

  const keepFocusOut = (event: MouseEvent<HTMLDivElement>): void => {
    if (editing()) return
    event.preventDefault()
    event.stopPropagation()
  }

  const down = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.button !== PRIMARY_BUTTON || editing()) return
    event.currentTarget.setPointerCapture(event.pointerId)
    held.current = { downX: event.clientX, from: value, width: event.currentTarget.getBoundingClientRect().width, moved: false }
  }

  const move = (event: PointerEvent<HTMLDivElement>): void => {
    const grip = held.current
    if (!grip) return
    const shift = event.clientX - grip.downX
    if (!grip.moved && Math.abs(shift) <= TAP_SLOP) return
    grip.moved = true
    const perPixel = ranged ? (high - low) / grip.width : step * (event.shiftKey ? SHIFT_FACTOR : 1)
    const wanted = grip.from + shift * perPixel
    const beyond = wanted > high ? (wanted - high) / perPixel : wanted < low ? (wanted - low) / perPixel : 0
    const limit = Math.min(STRETCH_LIMIT, grip.width * STRETCH_SHARE)
    setScrubbing(true)
    setPull({ stretch: Math.abs(rubber(beyond, limit, STRETCH_RUN)) / grip.width, wall: beyond < 0 ? 'start' : beyond > 0 ? 'end' : pull.wall })
    const next = settled(wanted)
    if (next !== value) onValueChange(next)
  }

  const up = (): void => {
    const grip = held.current
    if (!grip) return
    held.current = null
    setScrubbing(false)
    setPull({ stretch: 0, wall: pull.wall })
    if (grip.moved) return
    const input = field()
    input?.focus()
    input?.select()
  }

  const key = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') event.currentTarget.blur()
    else if (event.key === 'Escape') {
      setDraft(null)
      const input = event.currentTarget
      window.setTimeout(() => input.blur())
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const typed = draft === null ? Number.NaN : Number.parseFloat(draft.replace(',', '.'))
      const from = Number.isFinite(typed) ? typed : value
      const next = settled(from + (event.key === 'ArrowUp' ? 1 : -1) * step * (event.shiftKey ? SHIFT_FACTOR : 1))
      onValueChange(next)
      setDraft(next.toFixed(decimals))
    }
  }

  return (
    <div
      ref={host}
      className="ps"
      data-editing={draft === null ? undefined : ''}
      data-scrubbing={scrubbing ? '' : undefined}
      data-over={pull.stretch === 0 ? undefined : ''}
      data-wall={pull.wall}
      style={{ '--ps-stretch': pull.stretch, '--ps-value': ranged ? (value - low) / (high - low) : 0 } as CSSProperties}
      onMouseDownCapture={keepFocusOut}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <Input
        role="spinbutton"
        aria-label={name}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={unit === undefined ? shown : `${shown} ${unit}`}
        inputMode="decimal"
        autoComplete="off"
        start={label === undefined ? undefined : <span className="ps-tag">{label}</span>}
        end={unit === undefined ? undefined : <span className="ps-unit">{unit}</span>}
        value={draft ?? shown}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onFocus={(event) => {
          setDraft(shown)
          event.currentTarget.select()
        }}
        onBlur={commit}
        onKeyDown={key}
      />
      {ranged && (
        <span className="ps-clip" aria-hidden="true">
          <span className="ps-fill" />
        </span>
      )}
    </div>
  )
}
