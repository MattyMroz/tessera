import { Field, FieldDescription, FieldError, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Input } from '@mattymroz/tessera/components/input/input'
import Link from 'lucide-react/icons/link'
import { Edge, LONG } from '../edge'

export function FieldEdge() {
  return (
    <Edge data-edge-component="field" title="Field">
      <Field>
        <FieldLabel>A</FieldLabel>
        <Input defaultValue="A" />
      </Field>
      <Field invalid>
        <FieldLabel>{LONG}</FieldLabel>
        <FieldDescription>{LONG}</FieldDescription>
        <Input defaultValue={LONG} start={<Link />} />
        <FieldError match>{LONG}</FieldError>
      </Field>
    </Edge>
  )
}
