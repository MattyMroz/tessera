'use client'

import { Card } from '@mattymroz/tessera/components/card/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Input } from '@mattymroz/tessera/components/input/input'
import { ToggleGroup, ToggleGroupItem } from '@mattymroz/tessera/components/toggle-group/toggle-group'
import Link from 'lucide-react/icons/link'
import { Group } from './group'

const QUALITIES = ['Fast', 'Balanced', 'Best'] as const

export function FieldSection() {
  return (
    <section aria-labelledby="field-title" className="flex flex-col gap-group">
      <h2 id="field-title">Field</h2>
      <Group title="Fields sharing the columns of a card: required, invalid, disabled, a group of choices">
      <Card data-testid="field-card" container>
        <Field>
          <FieldLabel>Backend URL</FieldLabel>
          <FieldDescription>The address of the local backend.</FieldDescription>
          <Input type="url" required placeholder="http://127.0.0.1:8721" start={<Link />} />
          <FieldError>Enter a full URL with its scheme, for example http://127.0.0.1:8721.</FieldError>
        </Field>
        <Field>
          <FieldLabel>Contact e-mail</FieldLabel>
          <Input type="email" defaultValue="translator@" />
          <FieldError />
        </Field>
        <Field disabled>
          <FieldLabel>Project folder</FieldLabel>
          <FieldDescription>Set when the project is created.</FieldDescription>
          <Input defaultValue="D:/manga/one-piece" />
        </Field>
        <Field>
          <FieldLabel>Quality</FieldLabel>
          <FieldDescription>A group of choices takes the focus from a click on the label.</FieldDescription>
          <ToggleGroup aria-label="Quality" defaultValue="Balanced">
            {QUALITIES.map((quality) => (
              <ToggleGroupItem key={quality} value={quality}>
                {quality}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      </Card>
      </Group>
      <Group title="In a narrow card">
      <div className="w-80 max-w-full">
        <Card data-testid="field-column" container>
          <Field>
            <FieldLabel>Chapter title</FieldLabel>
            <FieldDescription>Shown in the project tree.</FieldDescription>
            <Input required defaultValue="Chapter 12" />
            <FieldError />
          </Field>
        </Card>
      </div>
      </Group>
    </section>
  )
}
