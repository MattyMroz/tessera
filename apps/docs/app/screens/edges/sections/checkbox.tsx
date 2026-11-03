import { Checkbox } from '@mattymroz/tessera/components/checkbox/checkbox'
import { Edge } from '../edge'

export function CheckboxEdge() {
  return (
    <Edge data-edge-component="checkbox" title="Checkbox">
      <Checkbox size="xs" aria-label="Extra small" defaultChecked />
      <Checkbox size="xl" aria-label="Extra large" indeterminate />
      <Checkbox aria-label="Invalid" aria-invalid />
      <Checkbox defaultChecked>Keep the original page under the translated text when the export runs</Checkbox>
    </Edge>
  )
}
