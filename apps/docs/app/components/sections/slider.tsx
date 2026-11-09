'use client'

import { Card } from '@mattymroz/tessera/components/card/card'
import { Field, FieldDescription, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Slider } from '@mattymroz/tessera/components/slider/slider'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { useState } from 'react'
import { Group } from './group'

const EFFORT = ['Low', 'Medium', 'High', 'Extra high'] as const
const percent = (value: number): string => `${value}%`
const effort = (value: number): string => EFFORT[value] ?? ''
const days = (value: number): string => (value === 1 ? '1 day' : `${value} days`)

export function SliderSection() {
  const [volume, setVolume] = useState(30)
  const [capped, setCapped] = useState(20)

  return (
    <section aria-labelledby="slider-title" className="flex flex-col gap-group">
      <h2 id="slider-title">Slider</h2>
      <Group title="Continuous and stepped">
        <div className="flex flex-wrap items-center gap-card">
          <div className="w-72" data-testid="slider-opacity">
            <Slider min={0} max={100} defaultValue={40} format={percent} end="100%" aria-label="Opacity" />
          </div>
          <div className="w-72" data-testid="slider-effort">
            <Slider min={0} max={3} defaultValue={1} format={effort} aria-label="Effort" />
          </div>
          <div className="w-72" data-testid="slider-weight">
            <Slider min={100} max={900} step={100} defaultValue={400} aria-label="Weight" />
          </div>
        </div>
      </Group>
      <Group title="Sizes">
        <div className="flex flex-wrap items-end gap-card">
          {THEME_CONFIG.axes.size.map((size) => (
            <div key={size} className="w-64" data-testid={`slider-size-${size}`}>
              <Slider size={size} min={0} max={100} defaultValue={50} format={percent} end="100%" aria-label={`Opacity (${size})`} />
            </div>
          ))}
        </div>
      </Group>
      <Group title="Ends, a long text and a disabled slider">
        <div className="flex flex-wrap items-center gap-card">
          <div className="w-72">
            <Slider min={0} max={100} defaultValue={0} format={percent} aria-label="Empty" />
          </div>
          <div className="w-72">
            <Slider min={0} max={100} defaultValue={100} format={percent} end="100%" aria-label="Full" />
          </div>
          <div className="w-72">
            <Slider min={1} max={7} defaultValue={2} format={days} aria-label="Retention" />
          </div>
          <div className="w-72">
            <Slider min={0} max={100} defaultValue={60} format={percent} end="100%" disabled aria-label="Disabled" />
          </div>
        </div>
      </Group>
      <Group title="Controlled">
        <div className="flex flex-wrap items-center gap-card">
          <div className="w-72" data-testid="slider-controlled">
            <Slider min={0} max={100} value={volume} onValueChange={setVolume} format={percent} aria-label="Volume" />
          </div>
          <div className="w-72" data-testid="slider-capped">
            <Slider min={0} max={100} value={capped} onValueChange={(next) => setCapped(Math.min(50, next))} format={percent} aria-label="Capped at 50" />
          </div>
          <span>
            Value the page holds for Volume: <output data-testid="slider-volume">{volume}</output>
          </span>
        </div>
      </Group>
      <Group title="In a field">
        <Card data-testid="slider-card" container>
          <Field>
            <FieldLabel id="slider-blur-label">Blur</FieldLabel>
            <FieldDescription>How much the panels soften what is behind them.</FieldDescription>
            <Slider min={0} max={40} defaultValue={12} aria-labelledby="slider-blur-label" />
          </Field>
          <Field>
            <FieldLabel id="slider-effort-label">Effort</FieldLabel>
            <Slider min={0} max={3} defaultValue={2} format={effort} aria-labelledby="slider-effort-label" />
          </Field>
        </Card>
      </Group>
    </section>
  )
}
