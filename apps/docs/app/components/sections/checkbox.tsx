'use client'

import { Card } from '@mattymroz/tessera/components/card/card'
import { Checkbox, CheckboxGroup } from '@mattymroz/tessera/components/checkbox/checkbox'
import { Field, FieldDescription, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { THEME_CONFIG } from '@mattymroz/tessera/lib/theme'
import { Group } from './group'

const STATES = [
  { name: 'off', props: {} },
  { name: 'on', props: { defaultChecked: true } },
  { name: 'mixed', props: { indeterminate: true } },
  { name: 'off, disabled', props: { disabled: true } },
  { name: 'on, disabled', props: { defaultChecked: true, disabled: true } },
] as const

const PAGES = ['Page 1', 'Page 2', 'Page 3']

export function CheckboxSection() {
  return (
    <section aria-labelledby="checkbox-title" className="flex flex-col gap-group">
      <h2 id="checkbox-title">Checkbox</h2>
      <Group title="States in every size">
        {THEME_CONFIG.axes.size.map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-group" data-testid={`checkbox-row-${size}`}>
            {STATES.map(({ name, props }) => (
              <Checkbox key={name} size={size} aria-label={`${size} ${name}`} {...props} />
            ))}
          </div>
        ))}
      </Group>
      <Group title="Group with a parent">
        <div className="flex flex-wrap items-start gap-card">
          {THEME_CONFIG.axes.size.map((size) => (
            <CheckboxGroup key={size} size={size} aria-label={`Pages ${size}`} allValues={PAGES} defaultValue={['Page 1']} data-testid={`checkbox-group-${size}`}>
              <Checkbox parent>Select all</Checkbox>
              {PAGES.map((page) => (
                <Checkbox key={page} value={page}>
                  {page}
                </Checkbox>
              ))}
            </CheckboxGroup>
          ))}
        </div>
      </Group>
      <Group title="In a field">
        <Card data-testid="checkbox-card" container>
          <Field>
            <FieldLabel>Show text</FieldLabel>
            <FieldDescription>Draw the translated text over the page.</FieldDescription>
            <Checkbox defaultChecked />
          </Field>
          <Field disabled>
            <FieldLabel>Send crash reports</FieldLabel>
            <FieldDescription>Set by the administrator.</FieldDescription>
            <Checkbox defaultChecked />
          </Field>
        </Card>
      </Group>
    </section>
  )
}
