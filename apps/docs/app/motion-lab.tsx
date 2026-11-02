'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { Field, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Input } from '@mattymroz/tessera/components/input/input'
import { Popover, PopoverActions, PopoverPopup, PopoverTitle, PopoverTrigger } from '@mattymroz/tessera/components/popover/popover'
import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import { milliseconds } from '@mattymroz/tessera/lib/motion'
import { useState } from 'react'

type Tunable = { readonly name: string; readonly label: string; readonly unit: '' | 'ms' }

const TUNABLES: readonly Tunable[] = [
  { name: '--ts-motion-spring-stiffness', label: 'Spring stiffness', unit: '' },
  { name: '--ts-motion-spring-damping', label: 'Spring damping', unit: '' },
  { name: '--ts-motion-duration-slide', label: 'Firm duration (ms)', unit: 'ms' },
  { name: '--ts-motion-duration-elastic', label: 'Elastic duration (ms)', unit: 'ms' },
  { name: '--ts-motion-elastic-overshoot', label: 'Elastic overshoot', unit: '' },
]
const HOVER_FADE = '--ts-in-motion-hover-fade'
const HOVER_EXITS = { cut: '0', fade: '1' } as const

type HoverExit = keyof typeof HOVER_EXITS

function isHoverExit(value: string): value is HoverExit {
  return Object.hasOwn(HOVER_EXITS, value)
}

function engineValue(tunable: Tunable): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(tunable.name)
  return String(tunable.unit === 'ms' ? milliseconds(value) : Number.parseFloat(value))
}

function readAll(): Record<string, string> {
  return Object.fromEntries(TUNABLES.map((tunable) => [tunable.name, engineValue(tunable)]))
}

export function MotionLab() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [exit, setExit] = useState<HoverExit>('fade')

  const tune = (tunable: Tunable, value: string): void => {
    setValues((current) => ({ ...current, [tunable.name]: value }))
    if (Number.isFinite(Number.parseFloat(value))) document.documentElement.style.setProperty(tunable.name, `${value}${tunable.unit}`)
  }

  const reset = (): void => {
    for (const tunable of TUNABLES) document.documentElement.style.removeProperty(tunable.name)
    document.documentElement.style.removeProperty(HOVER_FADE)
    setExit('fade')
    setValues(readAll())
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) setValues(readAll())
      }}
    >
      <PopoverTrigger variant="soft">Motion lab</PopoverTrigger>
      <PopoverPopup>
        <PopoverTitle>Motion lab</PopoverTitle>
        <ToggleGroup
          aria-label="Hover exit"
          value={exit}
          onValueChange={(value) => {
            if (!isHoverExit(value)) return
            setExit(value)
            document.documentElement.style.setProperty(HOVER_FADE, HOVER_EXITS[value])
          }}
        >
          <ToggleGroupItem value="cut">cut</ToggleGroupItem>
          <ToggleGroupItem value="fade">fade</ToggleGroupItem>
        </ToggleGroup>
        {TUNABLES.map((tunable) => (
          <Field key={tunable.name}>
            <FieldLabel>{tunable.label}</FieldLabel>
            <Input type="number" step="any" value={values[tunable.name] ?? ''} onChange={(event) => tune(tunable, event.currentTarget.value)} />
          </Field>
        ))}
        <PopoverActions>
          <Button variant="outline" onClick={reset}>
            Reset motion
          </Button>
        </PopoverActions>
      </PopoverPopup>
    </Popover>
  )
}
