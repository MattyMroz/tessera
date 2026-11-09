'use client'

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type Ref } from 'react'
import { composeRefs } from '../../lib/compose-refs'
import type { InstanceValues } from '../../lib/instance'
import { fractionOf, isStepped, stopsOf, widestValues, type Range } from '../../lib/range'
import { driveSlider, swapText, type SliderDrive } from '../../lib/slider'
import type { Choices } from '../../lib/theme'

type Naming =
  | { readonly 'aria-label': string; readonly 'aria-labelledby'?: undefined }
  | { readonly 'aria-labelledby': string; readonly 'aria-label'?: undefined }

export type SliderProps = Naming & {
  readonly min: number
  readonly max: number
  readonly step?: number
  readonly value?: number
  readonly defaultValue?: number
  readonly onValueChange?: (value: number) => void
  readonly onValueCommit?: (value: number) => void
  readonly format?: (value: number) => string
  readonly end?: string
  readonly size?: Choices['size']
  readonly disabled?: boolean
  readonly ref?: Ref<HTMLDivElement>
}

type ValueStore = {
  readonly get: () => number
  readonly set: (value: number) => void
  readonly subscribe: (listener: () => void) => () => void
}

type Latest = {
  readonly range: Range
  readonly format: (value: number) => string
  readonly onValueChange: ((value: number) => void) | undefined
  readonly onValueCommit: ((value: number) => void) | undefined
}

type ValueTextProps = { readonly value: number; readonly format: (value: number) => string; readonly swaps: boolean }

function createValueStore(initial: number): ValueStore {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set: (next) => {
      if (next === value) return
      value = next
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

function fadeIn(label: HTMLSpanElement | null): void {
  if (label) swapText(label, false)
}

function fadeOut(label: HTMLSpanElement | null): void {
  if (label) swapText(label, true)
}

function ValueText({ value, format, swaps }: ValueTextProps) {
  const text = format(value)
  const [shown, setShown] = useState<{ readonly text: string; readonly left: string | null }>({ text, left: null })
  if (shown.text !== text) setShown({ text, left: swaps ? shown.text : null })
  const swapped = shown.left !== null

  return (
    <>
      {shown.left !== null && (
        <span key={`${shown.left}:${text}`} ref={fadeOut} data-slot="label">
          {shown.left}
        </span>
      )}
      <span key={swapped ? text : undefined} ref={swapped ? fadeIn : undefined} data-slot="label">
        {text}
      </span>
    </>
  )
}

function OwnValue({ store, format, swaps }: Omit<ValueTextProps, 'value'> & { readonly store: ValueStore }) {
  const value = useSyncExternalStore(store.subscribe, store.get, store.get)
  return <ValueText value={value} format={format} swaps={swaps} />
}

export function Slider({
  min,
  max,
  step: everyStep,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  format: formatValue,
  end,
  size,
  disabled,
  ref,
  'aria-label': label,
  'aria-labelledby': labelledBy,
}: SliderProps) {
  const step = everyStep ?? 1
  const format = formatValue ?? String
  const [store] = useState(() => createValueStore(value ?? defaultValue ?? min))
  const [committed, setCommitted] = useState(store.get)
  const root = useRef<HTMLDivElement>(null)
  const drive = useRef<SliderDrive | null>(null)
  const range: Range = { min, max, step }
  const latest = useRef<Latest>({ range, format, onValueChange, onValueCommit })
  const current = value ?? committed
  const fraction = fractionOf(current, range)
  const stops = stopsOf(range)
  const stepped = isStepped(range)
  const ended = end !== undefined

  useLayoutEffect(() => {
    latest.current = { range, format, onValueChange, onValueCommit }
  })

  useLayoutEffect(() => {
    if (!root.current) return
    const connected = driveSlider(root.current, {
      range: () => latest.current.range,
      value: store.get,
      text: (next) => latest.current.format(next),
      onInput: (next) => {
        store.set(next)
        latest.current.onValueChange?.(next)
      },
      onCommit: (next) => {
        setCommitted(next)
        latest.current.onValueCommit?.(next)
      },
    })
    drive.current = connected
    return () => {
      connected.disconnect()
      drive.current = null
    }
  }, [store, ended])

  useLayoutEffect(() => {
    if (value !== undefined) store.set(value)
    drive.current?.show()
  })

  return (
    <div
      ref={composeRefs(ref, root)}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={format(current)}
      aria-disabled={disabled ? true : undefined}
      data-component="slider"
      data-recipe="surface"
      data-level="sunken"
      data-surface="track"
      data-inset="inset"
      data-variant="slider"
      data-size={size}
      data-focus="outer"
    >
      {stepped && (
        <span data-slot="marks" aria-hidden="true">
          {Array.from({ length: stops }, (_, index) => (
            <span key={index} data-slot="mark" style={{ '--ts-i-value': (index + 1) / stops } satisfies InstanceValues as CSSProperties} />
          ))}
        </span>
      )}
      {ended && (
        <span data-slot="end" aria-hidden="true">
          {end}
        </span>
      )}
      <span data-recipe="indicator" data-variant="fill" aria-hidden="true">
        <span data-slot="cap" />
        <span data-slot="lane">
          <span data-slot="bar" style={{ '--ts-i-value': fraction } satisfies InstanceValues as CSSProperties} />
          <span data-slot="ride" style={{ '--ts-i-value': fraction } satisfies InstanceValues as CSSProperties}>
            <span data-slot="grip" />
          </span>
        </span>
      </span>
      <span data-slot="value" aria-hidden="true">
        {widestValues(range).map((sample) => (
          <span key={sample} data-slot="sizer">
            {format(sample)}
          </span>
        ))}
        {value === undefined ? <OwnValue store={store} format={format} swaps={stepped} /> : <ValueText value={value} format={format} swaps={stepped} />}
      </span>
    </div>
  )
}
