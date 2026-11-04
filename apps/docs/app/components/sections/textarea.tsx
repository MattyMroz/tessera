'use client'

import { Field, FieldDescription, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Textarea } from '@mattymroz/tessera/components/input/textarea'

export function TextareaSection() {
  return (
    <section aria-labelledby="textarea-title" className="flex flex-col gap-group">
      <h2 id="textarea-title">Textarea</h2>
      <div className="flex flex-wrap items-start gap-group">
        <Textarea aria-label="Notes" placeholder="Grows with its text" />
      </div>
      <div className="grid grid-cols-1 gap-group md:grid-cols-2">
        <Textarea aria-label="Summary" maxRows={4} defaultValue="Grows up to four lines, then scrolls." />
        <Field>
          <FieldLabel>Translator notes</FieldLabel>
          <FieldDescription>Sent with every page of the chapter.</FieldDescription>
          <Textarea />
        </Field>
        <Field disabled>
          <FieldLabel>Locked notes</FieldLabel>
          <Textarea defaultValue="A disabled field dims the textarea." />
        </Field>
        <Textarea aria-label="Read-only notes" readOnly defaultValue="Read only" />
        <Textarea aria-label="Small notes" size="sm" defaultValue="Size sm" />
      </div>
    </section>
  )
}
