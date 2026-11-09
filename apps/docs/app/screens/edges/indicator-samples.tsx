'use client'

import { Button } from '@mattymroz/tessera/components/button/button'
import { useIndicator, type IndicatorParts } from '@mattymroz/tessera/lib/indicator'
import { useCallback, useState } from 'react'

const TAB = '[role="tab"]'
const OPTION = '[role="option"]'
const SHORT_NAME = 'Pages'
const LONG_NAME = 'Pages of the whole volume'
const LAYERS = ['Text', 'Bubbles', 'Panels'] as const
const CHOSEN_LAYER = 'Bubbles'
const PICKED_LAYERS: ReadonlySet<string> = new Set(['Text', 'Panels'])

function Pill({ ride, squash }: Pick<IndicatorParts, 'ride' | 'squash'>) {
  return (
    <div ref={ride} data-recipe="indicator" data-variant="raised" aria-hidden="true">
      <div ref={squash} data-slot="squash" />
    </div>
  )
}

export function MovingTargetSample() {
  const [long, setLong] = useState(false)
  const { container, select, ...pill } = useIndicator({ axis: 'x', items: TAB })
  const setTarget = useCallback((element: HTMLElement | null) => select(element, null), [select])

  return (
    <div className="flex flex-wrap items-center gap-group">
      <div
        ref={container}
        role="tablist"
        aria-label="Moving target"
        data-recipe="surface"
        data-level="sunken"
        data-surface="track"
        data-inset="inset"
        className="flex w-80 max-w-full items-center"
      >
        <Pill {...pill} />
        <button type="button" role="tab" aria-selected="false" tabIndex={-1} data-recipe="control" data-variant="ghost">
          <span data-slot="label">{long ? LONG_NAME : SHORT_NAME}</span>
        </button>
        <button ref={setTarget} type="button" role="tab" aria-selected="true" data-recipe="control" data-variant="ghost">
          <span data-slot="label">Layers</span>
        </button>
      </div>
      <Button variant="outline" onClick={() => setLong((value) => !value)}>
        Rename the first tab
      </Button>
    </div>
  )
}

export function ChoiceListsSample() {
  const { container, select, ...pill } = useIndicator({ axis: 'y', items: OPTION })
  const setChosen = useCallback((element: HTMLElement | null) => select(element, null), [select])

  return (
    <div className="flex flex-wrap items-start gap-group">
      <div ref={container} role="listbox" aria-label="One layer" data-recipe="surface" data-level="raised" data-surface="" data-inset="inset" className="flex flex-col">
        <Pill {...pill} />
        {LAYERS.map((layer) => (
          <div key={layer} ref={layer === CHOSEN_LAYER ? setChosen : undefined} role="option" aria-selected={layer === CHOSEN_LAYER} data-recipe="row">
            <span data-slot="label">{layer}</span>
          </div>
        ))}
      </div>
      <div
        role="listbox"
        aria-label="Many layers"
        aria-multiselectable="true"
        data-recipe="surface"
        data-level="raised"
        data-surface=""
        data-inset="inset"
        className="flex flex-col"
      >
        {LAYERS.map((layer) => (
          <div key={layer} role="option" aria-selected={PICKED_LAYERS.has(layer)} data-recipe="row">
            <span data-slot="label">{layer}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
