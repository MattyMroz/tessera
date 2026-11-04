'use client'

import { Field, FieldDescription, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Textarea } from '@mattymroz/tessera/components/input/textarea'
import { Group } from './group'

export function TextareaSection() {
  return (
    <section aria-labelledby="textarea-title" className="flex flex-col gap-group">
      <h2 id="textarea-title">Textarea</h2>
      <Group title="Grows with its text">
        <div className="flex flex-wrap items-start gap-group">
          <Textarea aria-label="Notes" placeholder="Grows with its text" />
        </div>
      </Group>
      <Group title="Up to four lines">
        <div className="md:w-1/2">
          <Textarea aria-label="Summary" maxRows={4} defaultValue="Grows up to four lines, then scrolls." />
        </div>
      </Group>
      <Group title="In a field">
        <div className="md:w-1/2">
          <Field>
            <FieldLabel>Translator notes</FieldLabel>
            <FieldDescription>Sent with every page of the chapter.</FieldDescription>
            <Textarea />
          </Field>
        </div>
      </Group>
      <Group title="Disabled field">
        <div className="md:w-1/2">
          <Field disabled>
            <FieldLabel>Locked notes</FieldLabel>
            <Textarea defaultValue="A disabled field dims the textarea." />
          </Field>
        </div>
      </Group>
      <Group title="Read only">
        <div className="md:w-1/2">
          <Textarea aria-label="Read-only notes" readOnly defaultValue="Read only" />
        </div>
      </Group>
      <Group title="Size sm">
        <div className="md:w-1/2">
          <Textarea aria-label="Small notes" size="sm" defaultValue="Size sm" />
        </div>
      </Group>
    </section>
  )
}
