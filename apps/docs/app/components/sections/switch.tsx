'use client'

import { Card } from '@mattymroz/tessera/components/card/card'
import { Field, FieldDescription, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Switch } from '@mattymroz/tessera/components/switch/switch'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { Group } from './group'

const STATES = [
  { name: 'off', props: {} },
  { name: 'on', props: { defaultChecked: true } },
  { name: 'off, disabled', props: { disabled: true } },
  { name: 'on, disabled', props: { defaultChecked: true, disabled: true } },
] as const

export function SwitchSection() {
  return (
    <section aria-labelledby="switch-title" className="flex flex-col gap-group">
      <h2 id="switch-title">Switch</h2>
      <Group title="States in every size">
        {THEME_CONFIG.axes.size.map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-group" data-testid={`switch-row-${size}`}>
            {STATES.map(({ name, props }) => (
              <Switch key={name} size={size} aria-label={`${size} ${name}`} {...props} />
            ))}
          </div>
        ))}
      </Group>
      <Group title="With a label">
        <div className="flex flex-wrap items-start gap-card">
          {THEME_CONFIG.axes.size.map((size) => (
            <div key={size} className="flex flex-col gap-card-small" data-testid={`switch-labels-${size}`}>
              <Switch size={size} defaultChecked>
                Wi-Fi
              </Switch>
              <Switch size={size}>Bluetooth</Switch>
              <Switch size={size} disabled>
                Airplane mode
              </Switch>
            </div>
          ))}
        </div>
      </Group>
      <Group title="In a field">
        <Card data-testid="switch-card" container>
          <Field>
            <FieldLabel>Transparency</FieldLabel>
            <FieldDescription>Let the desktop show through the panels.</FieldDescription>
            <Switch defaultChecked />
          </Field>
          <Field>
            <FieldLabel>Blur</FieldLabel>
            <Switch />
          </Field>
        </Card>
      </Group>
    </section>
  )
}
