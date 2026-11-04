'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { Field, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Input } from '@mattymroz/tessera/components/input/input'
import { Popover, PopoverActions, PopoverPopup, PopoverTitle, PopoverTrigger } from '@mattymroz/tessera/components/popover/popover'
import { milliseconds } from '@mattymroz/tessera/lib/motion'
import { useState } from 'react'

type Tunable = { readonly name: string; readonly label: string; readonly unit: '' | 'ms' }

const TUNABLES: readonly Tunable[] = [
  { name: '--ts-motion-duration-hover-out', label: 'Hover exit (ms)', unit: 'ms' },
  { name: '--ts-motion-duration-follow', label: 'Follow (ms)', unit: 'ms' },
  { name: '--ts-motion-duration-choice', label: 'Choice (ms)', unit: 'ms' },
  { name: '--ts-motion-choice-overshoot', label: 'Choice overshoot', unit: '' },
  { name: '--ts-motion-duration-scene', label: 'Scene (ms)', unit: 'ms' },
]

function engineValue(tunable: Tunable): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(tunable.name)
  return String(tunable.unit === 'ms' ? milliseconds(value) : Number.parseFloat(value))
}

function readAll(): Record<string, string> {
  return Object.fromEntries(TUNABLES.map((tunable) => [tunable.name, engineValue(tunable)]))
}

export function MotionLab() {
  const [values, setValues] = useState<Record<string, string>>({})

  const tune = (tunable: Tunable, value: string): void => {
    setValues((current) => ({ ...current, [tunable.name]: value }))
    if (Number.isFinite(Number.parseFloat(value))) document.documentElement.style.setProperty(tunable.name, `${value}${tunable.unit}`)
  }

  const reset = (): void => {
    for (const tunable of TUNABLES) document.documentElement.style.removeProperty(tunable.name)
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
