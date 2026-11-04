import { Field, FieldLabel } from '@mattymroz/tessera/components/field/field'
import { Switch } from '@mattymroz/tessera/components/switch/switch'
import { Edge } from '../edge'

export function SwitchEdge() {
  return (
    <Edge data-edge-component="switch" title="Switch">
      <Switch size="xs" aria-label="Extra small" defaultChecked />
      <Switch size="xl" aria-label="Extra large" />
      <Field>
        <FieldLabel>Keep the panels transparent while the export of the whole chapter runs</FieldLabel>
        <Switch defaultChecked />
      </Field>
    </Edge>
  )
}
