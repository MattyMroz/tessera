import { Radio, RadioGroup } from '@mattymroz/tessera/components/radio/radio'
import { Edge } from '../edge'

export function RadioEdge() {
  return (
    <Edge data-edge-component="radio" title="Radio">
      <RadioGroup size="xs" aria-label="Extra small" defaultValue="a">
        <Radio value="a">First</Radio>
        <Radio value="b">Second</Radio>
      </RadioGroup>
      <RadioGroup size="xl" aria-label="Long labels" defaultValue="a">
        <Radio value="a">Translate every bubble of the chapter and keep the original lettering</Radio>
        <Radio value="b">Only the selected pages</Radio>
      </RadioGroup>
    </Edge>
  )
}
