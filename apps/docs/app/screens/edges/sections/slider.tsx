'use client'

import { Field, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Slider } from '@mattymroz/tessera/components/slider/slider'
import { Edge, LONG } from '../edge'

const percent = (value: number): string => `${value}%`
const long = (value: number): string => `${LONG} ${value}`

export function SliderEdge() {
  return (
    <Edge data-edge-component="slider" title="Slider">
      <div className="w-full">
        <Slider size="xs" min={0} max={100} defaultValue={30} format={percent} end="100%" aria-label="Extra small" />
      </div>
      <div className="w-full">
        <Slider size="xl" min={0} max={100} defaultValue={70} format={percent} end="100%" aria-label="Extra large" />
      </div>
      <div className="w-full">
        <Slider min={0} max={3} defaultValue={1} format={long} aria-label="A long value" />
      </div>
      <Field>
        <FieldLabel id="slider-edge-label">Soften the panels while the export of the whole chapter runs</FieldLabel>
        <Slider min={0} max={40} defaultValue={12} aria-labelledby="slider-edge-label" />
      </Field>
    </Edge>
  )
}
