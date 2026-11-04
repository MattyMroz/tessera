'use client'

import { Radio, RadioGroup } from '@mattymroz/tessera/components/radio/radio'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { Group } from './group'

const QUALITIES = ['Fast', 'Balanced', 'Best'] as const

export function RadioSection() {
  return (
    <section aria-labelledby="radio-title" className="flex flex-col gap-group">
      <h2 id="radio-title">Radio</h2>
      <Group title="Groups in every size">
        <div className="flex flex-wrap items-start gap-card">
          {THEME_CONFIG.axes.size.map((size) => (
            <RadioGroup key={size} size={size} aria-label={`Quality ${size}`} defaultValue="Balanced" data-testid={`radio-group-${size}`}>
              {QUALITIES.map((quality) => (
                <Radio key={quality} value={quality}>
                  {quality}
                </Radio>
              ))}
              <Radio value="Draft" disabled>
                Draft
              </Radio>
            </RadioGroup>
          ))}
        </div>
      </Group>
    </section>
  )
}
